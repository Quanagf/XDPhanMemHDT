package com.evrental.booking.service;

import com.evrental.booking.dto.*;
import com.evrental.booking.model.*;
import com.evrental.booking.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleHandoverService {

    private final VehicleHandoverRepository handoverRepository;
    private final BookingRepository bookingRepository;
    private final BookingContractRepository contractRepository;
    private final MinioService minioService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${service.url.vehicles}")
    private String vehicleServiceUrl;

    @Value("${service.url.users}")
    private String userServiceUrl;

    @Value("${service.url.payment}")
    private String paymentServiceUrl;

    /**
     * Hủy booking khi khách không đến
     */
    @Transactional
    public void cancelBooking(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking không tồn tại"));

        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Chỉ có thể hủy booking ở trạng thái CONFIRMED");
        }

        // Cập nhật status thành CANCELLED
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancelledAt(LocalDateTime.now());
        bookingRepository.save(booking);

        // Cập nhật trạng thái xe về AVAILABLE
        try {
            restTemplate.put(
                vehicleServiceUrl + "/api/vehicles/" + booking.getVehicleId() + "/status/AVAILABLE",
                null
            );
            log.info("✅ Đã cập nhật xe {} về trạng thái AVAILABLE", booking.getVehicleId());
        } catch (Exception e) {
            log.error("❌ Lỗi cập nhật trạng thái xe: {}", e.getMessage());
            // Không throw exception để không block hủy booking
        }

        log.info("✅ Đã hủy booking {} - Lý do: {}", bookingId, reason);
    }

    /**
     * Quy trình nhận xe (PICKUP)
     * 1. Xác nhận khách hàng đến điểm
     * 2. Xác thực GPLX/CCCD
     * 3. Chụp ảnh tình trạng xe
     * 4. Tạo hợp đồng + chữ ký điện tử
     * 5. Thu tiền đặt cọc
     */
    @Transactional
    public HandoverDetailsDTO processPickup(VehiclePickupRequest request, List<MultipartFile> vehicleImages,
                                            MultipartFile renterSignatureFile, MultipartFile staffSignatureFile) {
        // 1. Kiểm tra booking
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking không tồn tại"));

        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Booking phải ở trạng thái CONFIRMED để có thể giao xe");
        }

        // 2. Kiểm tra khách hàng đã đến chưa
        if (!Boolean.TRUE.equals(request.getCustomerArrived())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Vui lòng xác nhận khách hàng đã đến điểm nhận xe");
        }

        // 3. Kiểm tra đã xác thực khách hàng chưa
        if (!Boolean.TRUE.equals(request.getCustomerVerified())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Vui lòng xác thực GPLX/CCCD của khách hàng");
        }

        // 4. Upload ảnh xe lên MinIO
        List<String> imageUrls = new ArrayList<>();
        if (vehicleImages != null && !vehicleImages.isEmpty()) {
            for (MultipartFile image : vehicleImages) {
                try {
                    String url = minioService.uploadFile(image, "vehicle-handover/pickup");
                    imageUrls.add(url);
                } catch (Exception e) {
                    log.error("Lỗi upload ảnh xe: {}", e.getMessage());
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                        "Không thể upload ảnh xe");
                }
            }
        }

        // 4.5. Upload chữ ký điện tử lên MinIO
        String renterSignatureUrl = null;
        String staffSignatureUrl = null;
        
        // Upload renter signature file if provided
        if (renterSignatureFile != null && !renterSignatureFile.isEmpty()) {
            try {
                renterSignatureUrl = minioService.uploadFile(renterSignatureFile, "signatures/renter");
                log.info("✅ Uploaded renter signature: {}", renterSignatureUrl);
            } catch (Exception e) {
                log.error("❌ Lỗi upload chữ ký khách thuê: {}", e.getMessage());
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Không thể upload chữ ký khách thuê");
            }
        }
        
        // Upload staff signature file if provided
        if (staffSignatureFile != null && !staffSignatureFile.isEmpty()) {
            try {
                staffSignatureUrl = minioService.uploadFile(staffSignatureFile, "signatures/staff");
                log.info("✅ Uploaded staff signature: {}", staffSignatureUrl);
            } catch (Exception e) {
                log.error("❌ Lỗi upload chữ ký nhân viên: {}", e.getMessage());
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Không thể upload chữ ký nhân viên");
            }
        }

        // 5. Tạo hợp đồng
        String contractText = generateContract(booking, "PICKUP");
        BookingContract contract = BookingContract.builder()
                .booking(booking)
                .termsAndConditions(contractText)
                .renterSignature(renterSignatureUrl)
                .staffSignature(staffSignatureUrl)
                .checkinVehicleImageUrl(String.join(",", imageUrls))
                .signedAt(LocalDateTime.now())
                .build();
        contractRepository.save(contract);

        // 6. Tạo VehicleHandover record
        String imagesJson = null;
        try {
            imagesJson = objectMapper.writeValueAsString(imageUrls);
        } catch (Exception e) {
            log.error("Lỗi chuyển đổi images thành JSON: {}", e.getMessage());
        }

        VehicleHandover handover = VehicleHandover.builder()
                .bookingId(booking.getId())
                .handoverType(VehicleHandover.HandoverType.PICKUP)
                .staffId(request.getStaffId())
                .customerArrived(true)
                .customerVerified(true)
                .vehicleImages(imagesJson)
                .vehicleConditionNotes(request.getVehicleConditionNotes())
                .depositAmount(request.getDepositAmount())
                .paymentMethod(request.getPaymentMethod())
                .renterSignature(renterSignatureUrl)
                .staffSignature(staffSignatureUrl)
                .handoverTime(LocalDateTime.now())
                .build();
        
        VehicleHandover savedHandover = handoverRepository.save(handover);

        // 7. Ghi nhận thanh toán tiền cọc
        if (request.getDepositAmount() != null && request.getDepositAmount().compareTo(BigDecimal.ZERO) > 0) {
            createPaymentRecord(
                booking.getId(),
                savedHandover.getId(),
                "DEPOSIT",
                request.getDepositAmount(),
                request.getPaymentMethod(),
                request.getStaffId(),
                "Thanh toán tiền cọc khi nhận xe"
            );
        }

        // 8. Cập nhật Booking
        booking.setStatus(Booking.BookingStatus.ACTIVE);
        booking.setActualStartTime(LocalDateTime.now());
        booking.setStaffPickupId(request.getStaffId());
        booking.setDepositAmount(request.getDepositAmount());
        booking.setPickupVehicleImages(imagesJson);
        booking.setContract(contract);
        bookingRepository.save(booking);

        // 9. Cập nhật trạng thái xe thành RENTED
        try {
            restTemplate.put(
                vehicleServiceUrl + "/api/vehicles/" + booking.getVehicleId() + "/status/RENTED",
                null
            );
        } catch (Exception e) {
            log.error("Lỗi cập nhật trạng thái xe: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Không thể cập nhật trạng thái xe");
        }

        return convertToDTO(savedHandover, booking);
    }

    /**
     * Quy trình trả xe (RETURN)
     * 1. Xác thực xe trả đúng không
     * 2. Chụp ảnh tình trạng xe
     * 3. Tính toán phí phát sinh (nếu có)
     * 4. Thanh toán tiền còn lại
     * 5. Xác nhận hoàn tất
     */
    @Transactional
    public HandoverDetailsDTO processReturn(VehicleReturnRequest request, List<MultipartFile> vehicleImages,
                                           MultipartFile renterSignatureFile, MultipartFile staffSignatureFile) {
        // 1. Kiểm tra booking
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking không tồn tại"));

        if (booking.getStatus() != Booking.BookingStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Booking phải ở trạng thái ACTIVE để có thể trả xe");
        }

        // 2. Xác thực xe
        if (!Boolean.TRUE.equals(request.getVehicleVerified())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Vui lòng xác thực xe trả có phải xe của trạm không");
        }

        // 3. Upload ảnh xe khi trả
        List<String> imageUrls = new ArrayList<>();
        if (vehicleImages != null && !vehicleImages.isEmpty()) {
            for (MultipartFile image : vehicleImages) {
                try {
                    String url = minioService.uploadFile(image, "vehicle-handover/return");
                    imageUrls.add(url);
                } catch (Exception e) {
                    log.error("Lỗi upload ảnh xe: {}", e.getMessage());
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                        "Không thể upload ảnh xe");
                }
            }
        }

        // 3.5. Upload chữ ký điện tử lên MinIO
        String renterSignatureUrl = null;
        String staffSignatureUrl = null;
        
        // Upload renter signature file if provided
        if (renterSignatureFile != null && !renterSignatureFile.isEmpty()) {
            try {
                renterSignatureUrl = minioService.uploadFile(renterSignatureFile, "signatures/renter");
                log.info("✅ Uploaded renter signature for return: {}", renterSignatureUrl);
            } catch (Exception e) {
                log.error("❌ Lỗi upload chữ ký khách thuê: {}", e.getMessage());
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Không thể upload chữ ký khách thuê");
            }
        }
        
        // Upload staff signature file if provided
        if (staffSignatureFile != null && !staffSignatureFile.isEmpty()) {
            try {
                staffSignatureUrl = minioService.uploadFile(staffSignatureFile, "signatures/staff");
                log.info("✅ Uploaded staff signature for return: {}", staffSignatureUrl);
            } catch (Exception e) {
                log.error("❌ Lỗi upload chữ ký nhân viên: {}", e.getMessage());
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Không thể upload chữ ký nhân viên");
            }
        }

        // 4. Tính toán tổng tiền phải thanh toán
        BigDecimal additionalCharges = request.getAdditionalCharges() != null ? 
            request.getAdditionalCharges() : BigDecimal.ZERO;
        
        BigDecimal finalPayment = request.getFinalPaymentAmount() != null ?
            request.getFinalPaymentAmount() : BigDecimal.ZERO;

        // 5. Tạo VehicleHandover record
        String imagesJson = null;
        try {
            imagesJson = objectMapper.writeValueAsString(imageUrls);
        } catch (Exception e) {
            log.error("Lỗi chuyển đổi images thành JSON: {}", e.getMessage());
        }

        VehicleHandover handover = VehicleHandover.builder()
                .bookingId(booking.getId())
                .handoverType(VehicleHandover.HandoverType.RETURN)
                .staffId(request.getStaffId())
                .customerArrived(true)
                .customerVerified(true)
                .vehicleImages(imagesJson)
                .vehicleConditionNotes(request.getVehicleConditionNotes())
                .additionalCharges(additionalCharges)
                .additionalChargesReason(request.getAdditionalChargesReason())
                .finalPaymentAmount(finalPayment)
                .paymentMethod(request.getPaymentMethod())
                .renterSignature(renterSignatureUrl)
                .staffSignature(staffSignatureUrl)
                .handoverTime(LocalDateTime.now())
                .build();
        
        VehicleHandover savedHandover = handoverRepository.save(handover);

        // 6. Ghi nhận thanh toán
        if (finalPayment.compareTo(BigDecimal.ZERO) > 0) {
            createPaymentRecord(
                booking.getId(),
                savedHandover.getId(),
                "REMAINING",
                finalPayment,
                request.getPaymentMethod(),
                request.getStaffId(),
                "Thanh toán khi trả xe"
            );
        }

        // Ghi nhận phí phát sinh nếu có
        if (additionalCharges.compareTo(BigDecimal.ZERO) > 0) {
            createPaymentRecord(
                booking.getId(),
                savedHandover.getId(),
                "ADDITIONAL",
                additionalCharges,
                request.getPaymentMethod(),
                request.getStaffId(),
                request.getAdditionalChargesReason()
            );
        }

        // 6.5. Tính phí trễ nếu trả xe muộn hơn estimated_end_time + 2 ngày
        LocalDateTime actualEndTime = LocalDateTime.now();
        BigDecimal lateFee = BigDecimal.ZERO;
        
        if (booking.getEstimatedEndTime() != null) {
            LocalDateTime gracePeriodEnd = booking.getEstimatedEndTime().plusDays(2);
            if (actualEndTime.isAfter(gracePeriodEnd)) {
                // Tính số ngày trễ sau grace period (2 ngày)
                long daysLate = java.time.Duration.between(gracePeriodEnd, actualEndTime).toDays();
                if (daysLate > 0) {
                    // Phí trễ: 500k/ngày
                    lateFee = BigDecimal.valueOf(500000).multiply(BigDecimal.valueOf(daysLate));
                    log.warn("⚠️ Booking {} trả xe muộn {} ngày, phí trễ: {}đ", 
                            booking.getId(), daysLate, lateFee);
                    
                    // Cộng phí trễ vào additional_charges
                    BigDecimal totalAdditional = (additionalCharges != null ? additionalCharges : BigDecimal.ZERO)
                                                  .add(lateFee);
                    
                    // Cập nhật lý do phí phát sinh
                    String lateReason = "Phí trả xe muộn " + daysLate + " ngày sau thời hạn cho phép (+" 
                                      + lateFee.toString() + "đ)";
                    String newReason = request.getAdditionalChargesReason() != null 
                        ? request.getAdditionalChargesReason() + "; " + lateReason
                        : lateReason;
                    
                    // Cập nhật handover với phí trễ
                    savedHandover.setAdditionalCharges(totalAdditional);
                    savedHandover.setAdditionalChargesReason(newReason);
                    handoverRepository.save(savedHandover);
                    
                    // Ghi nhận phí trễ
                    createPaymentRecord(
                        booking.getId(),
                        savedHandover.getId(),
                        "LATE_FEE",
                        lateFee,
                        request.getPaymentMethod(),
                        request.getStaffId(),
                        lateReason
                    );
                    
                    // Cập nhật final payment
                    additionalCharges = totalAdditional;
                    finalPayment = finalPayment.add(lateFee);
                }
            }
        }

        // 7. Cập nhật Booking
        booking.setStatus(Booking.BookingStatus.COMPLETED);
        booking.setActualEndTime(actualEndTime);
        booking.setStaffReturnId(request.getStaffId());
        booking.setReturnVehicleImages(imagesJson);
        booking.setAdditionalCharges(additionalCharges);
        booking.setAdditionalChargesReason(request.getAdditionalChargesReason());
        booking.setFinalPaymentAmount(finalPayment);
        booking.setVehicleConditionNotes(request.getVehicleConditionNotes());
        bookingRepository.save(booking);

        // 8. Cập nhật trạng thái xe về AVAILABLE
        try {
            restTemplate.put(
                vehicleServiceUrl + "/api/vehicles/" + booking.getVehicleId() + "/status/AVAILABLE",
                null
            );
        } catch (Exception e) {
            log.error("Lỗi cập nhật trạng thái xe: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Không thể cập nhật trạng thái xe");
        }

        return convertToDTO(savedHandover, booking);
    }

    /**
     * Lấy danh sách xe cần nhận (PICKUP)
     */
    public List<HandoverDetailsDTO> getPendingPickups(Long stationId, LocalDateTime startDate, 
                                                      LocalDateTime endDate, String customerName) {
        // Lấy danh sách bookings CONFIRMED tại station
        List<Booking> bookings = bookingRepository.findByStartStationIdAndStatusOrderByBookingTimeAsc(
            stationId, Booking.BookingStatus.CONFIRMED);
        
        return bookings.stream()
                .filter(b -> filterByDateAndCustomer(b, startDate, endDate, customerName))
                .map(b -> convertBookingToPickupDTO(b))
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách xe cần trả (RETURN)
     * KHÔNG giới hạn thời gian - hiển thị tất cả xe đã giao chưa trả
     */
    public List<HandoverDetailsDTO> getPendingReturns(Long stationId, LocalDateTime startDate, 
                                                      LocalDateTime endDate, String customerName) {
        // Lấy danh sách bookings ACTIVE tại station
        List<Booking> bookings = bookingRepository.findByStartStationIdAndStatusOrderByActualStartTimeAsc(
            stationId, Booking.BookingStatus.ACTIVE);
        
        return bookings.stream()
                .filter(b -> filterByDateAndCustomer(b, startDate, endDate, customerName))
                .map(b -> convertBookingToReturnDTO(b))
                .collect(Collectors.toList());
    }

    /**
     * Lấy lịch sử handovers
     */
    public List<HandoverDetailsDTO> getHandoverHistory(Long bookingId) {
        List<VehicleHandover> handovers = handoverRepository.findByBookingId(bookingId);
        return handovers.stream()
                .map(h -> {
                    Booking booking = bookingRepository.findById(h.getBookingId()).orElse(null);
                    return convertToDTO(h, booking);
                })
                .collect(Collectors.toList());
    }

    // === Helper Methods ===

    private boolean filterByDateAndCustomer(Booking booking, LocalDateTime startDate, 
                                           LocalDateTime endDate, String customerName) {
        // Filter by date - KHÔNG giới hạn thời gian
        // Tab "Nhận xe" cần hiển thị tất cả xe chưa trả, dù quá hạn bao lâu
        if (startDate != null || endDate != null) {
            LocalDate bookingDate = booking.getEstimatedStartTime() != null 
                ? booking.getEstimatedStartTime().toLocalDate() 
                : LocalDate.now();
            
            // Chỉ filter nếu user chọn range cụ thể
            if (startDate != null && bookingDate.isBefore(startDate.toLocalDate())) {
                return false;
            }
            if (endDate != null && bookingDate.isAfter(endDate.toLocalDate())) {
                return false;
            }
        }
        // Nếu KHÔNG có filter date → hiển thị TẤT CẢ (không giới hạn)
        
        // Filter by customer name
        if (customerName != null && !customerName.isEmpty()) {
            if (booking.getCustomerName() != null && 
                booking.getCustomerName().toLowerCase().contains(customerName.toLowerCase())) {
                return true;
            }
            // TODO: Fetch user name from user-service if userId exists
            return false;
        }
        
        return true;
    }

    private HandoverDetailsDTO convertBookingToPickupDTO(Booking booking) {
        log.info("🔄 Converting booking {} to pickup DTO", booking.getId());
        
        // Lấy thông tin xe từ vehicle-service
        String vehicleName = null;
        String vehiclePlate = null;
        try {
            String url = vehicleServiceUrl + "/api/vehicles/" + booking.getVehicleId();
            log.info("📞 Calling vehicle-service: {}", url);
            
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> vehicleInfo = restTemplate.getForObject(
                url,
                java.util.Map.class
            );
            log.info("✅ Vehicle info received: {}", vehicleInfo);
            
            if (vehicleInfo != null) {
                // Vehicle service trả về "type" (VF339, VF e34, etc.)
                Object typeObj = vehicleInfo.get("type");
                Object nameObj = vehicleInfo.get("name");
                
                // Ưu tiên type, fallback về name nếu type null
                vehicleName = typeObj != null ? typeObj.toString() : 
                             (nameObj != null ? nameObj.toString() : null);
                
                vehiclePlate = (String) vehicleInfo.get("licensePlate");
                log.info("🚗 Vehicle: {} - {}", vehicleName, vehiclePlate);
            }
        } catch (Exception e) {
            log.error("❌ Lỗi lấy thông tin xe từ vehicle-service: {}", e.getMessage(), e);
        }

        // Lấy tên khách hàng (nếu có userId)
        String customerName = booking.getCustomerName();
        String customerPhone = booking.getCustomerPhone();
        String customerEmail = booking.getCustomerEmail();
        
        if (booking.getUserId() != null && customerName == null) {
            try {
                String url = userServiceUrl + "/api/users/" + booking.getUserId();
                log.info("📞 Calling user-service: {}", url);
                
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> userInfo = restTemplate.getForObject(
                    url,
                    java.util.Map.class
                );
                log.info("✅ User info received: {}", userInfo);
                
                if (userInfo != null) {
                    customerName = (String) userInfo.get("fullName");
                    customerPhone = (String) userInfo.get("phoneNumber");
                    customerEmail = (String) userInfo.get("email");
                    log.info("👤 Customer: {} - {}", customerName, customerPhone);
                }
            } catch (Exception e) {
                log.error("❌ Lỗi lấy thông tin user từ user-service: {}", e.getMessage(), e);
            }
        }

        HandoverDetailsDTO dto = HandoverDetailsDTO.builder()
                .bookingId(booking.getId())
                .bookingCode("BK" + booking.getId())
                .handoverType(VehicleHandover.HandoverType.PICKUP)
                .bookingTime(booking.getBookingTime())
                .bookingType(booking.getBookingType().name())
                .totalCost(booking.getTotalCost())
                .customerName(customerName)
                .customerPhone(customerPhone)
                .customerEmail(customerEmail)
                .gplxImageUrl(booking.getGplxImageUrl())
                .cccdImageUrl(booking.getCccdImageUrl())
                .vehicleId(booking.getVehicleId())
                .vehicleName(vehicleName)
                .vehiclePlate(vehiclePlate)
                .estimatedTime(booking.getEstimatedStartTime())
                .build();
        
        log.info("✅ DTO created: bookingId={}, vehicle={}, customer={}", 
            dto.getBookingId(), dto.getVehicleName(), dto.getCustomerName());
        
        return dto;
    }

    private HandoverDetailsDTO convertBookingToReturnDTO(Booking booking) {
        // Lấy thông tin xe từ vehicle-service
        String vehicleName = null;
        String vehiclePlate = null;
        try {
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> vehicleInfo = restTemplate.getForObject(
                vehicleServiceUrl + "/api/vehicles/" + booking.getVehicleId(),
                java.util.Map.class
            );
            if (vehicleInfo != null) {
                log.info("✅ Vehicle info received for RETURN: {}", vehicleInfo);
                vehicleName = (String) vehicleInfo.get("type");
                if (vehicleName == null) {
                    vehicleName = (String) vehicleInfo.get("name");
                }
                vehiclePlate = (String) vehicleInfo.get("licensePlate");
                log.info("🚗 Vehicle for RETURN: {} - {}", vehicleName, vehiclePlate);
            }
        } catch (Exception e) {
            log.error("Lỗi lấy thông tin xe: {}", e.getMessage());
        }

        // Lấy tên khách hàng (nếu có userId)
        String customerName = booking.getCustomerName();
        String customerPhone = booking.getCustomerPhone();
        String customerEmail = booking.getCustomerEmail();
        
        if (booking.getUserId() != null && customerName == null) {
            try {
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> userInfo = restTemplate.getForObject(
                    userServiceUrl + "/api/users/" + booking.getUserId(),
                    java.util.Map.class
                );
                if (userInfo != null) {
                    customerName = (String) userInfo.get("fullName");
                    customerPhone = (String) userInfo.get("phoneNumber");
                    customerEmail = (String) userInfo.get("email");
                }
            } catch (Exception e) {
                log.error("Lỗi lấy thông tin user: {}", e.getMessage());
            }
        }

        return HandoverDetailsDTO.builder()
                .bookingId(booking.getId())
                .bookingCode("BK" + booking.getId())
                .handoverType(VehicleHandover.HandoverType.RETURN)
                .bookingTime(booking.getBookingTime())
                .bookingType(booking.getBookingType().name())
                .totalCost(booking.getTotalCost())
                .customerName(customerName)
                .customerPhone(customerPhone)
                .customerEmail(customerEmail)
                .gplxImageUrl(booking.getGplxImageUrl())
                .cccdImageUrl(booking.getCccdImageUrl())
                .vehicleId(booking.getVehicleId())
                .vehicleName(vehicleName)
                .vehiclePlate(vehiclePlate)
                .estimatedTime(booking.getEstimatedEndTime())
                .depositAmount(booking.getDepositAmount())
                .build();
    }

    private HandoverDetailsDTO convertToDTO(VehicleHandover handover, Booking booking) {
        List<String> imageUrls = new ArrayList<>();
        if (handover.getVehicleImages() != null) {
            try {
                imageUrls = objectMapper.readValue(handover.getVehicleImages(), 
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
            } catch (Exception e) {
                log.error("Lỗi parse images JSON: {}", e.getMessage());
            }
        }

        return HandoverDetailsDTO.builder()
                .id(handover.getId())
                .bookingId(handover.getBookingId())
                .bookingCode(booking != null ? "BK" + booking.getId() : null)
                .handoverType(handover.getHandoverType())
                .customerName(booking != null ? booking.getCustomerName() : null)
                .customerPhone(booking != null ? booking.getCustomerPhone() : null)
                .customerEmail(booking != null ? booking.getCustomerEmail() : null)
                .vehicleId(booking != null ? booking.getVehicleId() : null)
                .staffId(handover.getStaffId())
                .customerArrived(handover.getCustomerArrived())
                .customerVerified(handover.getCustomerVerified())
                .vehicleImageUrls(imageUrls)
                .vehicleConditionNotes(handover.getVehicleConditionNotes())
                .depositAmount(handover.getDepositAmount())
                .additionalCharges(handover.getAdditionalCharges())
                .additionalChargesReason(handover.getAdditionalChargesReason())
                .finalPaymentAmount(handover.getFinalPaymentAmount())
                .paymentMethod(handover.getPaymentMethod())
                .renterSignature(handover.getRenterSignature())
                .staffSignature(handover.getStaffSignature())
                .contractUrl(handover.getContractUrl())
                .actualHandoverTime(handover.getHandoverTime())
                .createdAt(handover.getCreatedAt())
                .build();
    }

    private String generateContract(Booking booking, String type) {
        return "HỢP ĐỒNG THUÊ XE ĐIỆN\n\n" +
               "Mã booking: BK" + booking.getId() + "\n" +
               "Loại: " + type + "\n" +
               "Điều khoản và điều kiện...\n";
    }

    /**
     * Gọi payment-service để tạo payment record
     */
    private void createPaymentRecord(Long bookingId, Long handoverId, String paymentType, 
                                     BigDecimal amount, String paymentMethod, Long staffId, String notes) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("bookingId", bookingId);
            request.put("handoverId", handoverId);
            request.put("paymentType", paymentType);
            request.put("amount", amount);
            request.put("paymentMethod", paymentMethod);
            request.put("paymentStatus", "COMPLETED");
            request.put("staffId", staffId);
            request.put("notes", notes);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            restTemplate.postForEntity(
                paymentServiceUrl + "/api/payment-records",
                entity,
                Object.class
            );
            
            log.info("Payment record created: type={}, amount={}", paymentType, amount);
        } catch (Exception e) {
            log.error("Lỗi khi tạo payment record: {}", e.getMessage());
            // Không throw exception để không làm gián đoạn flow nhận/trả xe
        }
    }
}
