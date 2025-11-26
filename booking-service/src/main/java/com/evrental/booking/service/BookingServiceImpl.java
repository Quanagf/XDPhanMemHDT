package com.evrental.booking.service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value; // <-- DÒNG MỚI (Import DTO để gửi đi)
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.evrental.booking.dto.BookingResponseDTO;
import com.evrental.booking.dto.CheckInRequest;
import com.evrental.booking.dto.CheckOutRequest;
import com.evrental.booking.dto.CreateBookingRequest;
import com.evrental.booking.dto.PaymentRequestDTO;
import com.evrental.booking.dto.StaffNotificationDTO;
import com.evrental.booking.dto.VehicleDTO; // Import công cụ gọi API
import com.evrental.booking.model.Booking;
import com.evrental.booking.model.BookingContract;
import com.evrental.booking.repository.BookingContractRepository;
import com.evrental.booking.repository.BookingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements IBookingService {

    // Inject các Repository
    private final BookingRepository bookingRepository;
    private final BookingContractRepository contractRepository;
    
    // Inject công cụ gọi API
    private final RestTemplate restTemplate;
    private final ExternalApiService externalApiService;
    
    // Inject notification service
    private final NotificationService notificationService;
    
    // Inject booking timeout service
    private final BookingTimeoutService bookingTimeoutService;
    
    // Inject MinIO service for file uploads
    private final MinioService minioService;
    
    // Inject walk-in customer service
    private final WalkInCustomerService walkInCustomerService;

    // Lấy URL của service khác từ application.properties
    @Value("${service.url.vehicles}")
    private String vehicleServiceUrl;
    
    @Value("${service.url.users}")
    private String userServiceUrl;
    
    @Value("${service.url.payment}") // <-- DÒNG MỚI (Inject URL của payment-service)
    private String paymentServiceUrl;

    @Override
    public Booking createBooking(CreateBookingRequest request, Long userId) {
        
        // --- BƯỚC 0: VALIDATE THỜI GIAN ---
        LocalDateTime estimatedStartTime = request.getEstimatedStartTimeAsLocalDateTime();
        LocalDateTime estimatedEndTime = request.getEstimatedEndTimeAsLocalDateTime();
        
        if (estimatedStartTime == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thời gian nhận xe không được để trống.");
        }
        
        if (estimatedEndTime == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thời gian trả xe không hợp lệ.");
        }
        
        // Kiểm tra thời gian trả xe phải sau thời gian nhận xe
        if (!estimatedEndTime.isAfter(estimatedStartTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Thời gian trả xe phải sau thời gian nhận xe.");
        }
        
        // Kiểm tra thời gian nhận xe phải trong tương lai (ít nhất 1 giờ)
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        LocalDateTime minimumStartTime = now.plusHours(1);
        
        if (estimatedStartTime.isBefore(minimumStartTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Thời gian nhận xe phải ít nhất 1 giờ sau thời điểm hiện tại.");
        }
        
        // Kiểm tra khoảng thời gian thuê tối thiểu
        Duration rentalDuration = Duration.between(estimatedStartTime, estimatedEndTime);
        long rentalHours = rentalDuration.toHours();
        
        // Với booking ON_SPOT, yêu cầu tối thiểu 4 giờ
        if (request.getBookingType() == Booking.BookingType.ON_SPOT && rentalHours < 4) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Đặt xe tại điểm yêu cầu tối thiểu 4 giờ thuê.");
        }
        
        // Với booking ADVANCE, yêu cầu tối thiểu 1 giờ
        if (request.getBookingType() == Booking.BookingType.ADVANCE && rentalHours < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Đặt trước yêu cầu tối thiểu 1 giờ thuê.");
        }
        
        // --- BƯỚC 1: GỌI API NỘI BỘ SANG VEHICLE-SERVICE ---
        VehicleDTO vehicle = restTemplate.getForObject(
            vehicleServiceUrl + "/api/vehicles/" + request.getVehicleId(),
            VehicleDTO.class
        );

        // --- BƯỚC 2: KIỂM TRA NGHIỆP VỤ ---
        if (vehicle == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy xe (Vehicle).");
        }
        if (vehicle.getStatus() != VehicleDTO.VehicleStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Xe không sẵn sàng (Not Available).");
        }
        
        // --- KIỂM TRA USER ĐÃ XÁC THỰC GPLX VÀ CCCD CHƯA ---
        try {
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> userVerification = restTemplate.getForObject(
                userServiceUrl + "/api/users/verification-status/" + userId,
                java.util.Map.class
            );
            
            if (userVerification == null) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể kiểm tra trạng thái xác thực người dùng.");
            }
            
            Boolean hasVerifiedLicense = (Boolean) userVerification.get("hasVerifiedLicense");
            Boolean hasVerifiedIdentity = (Boolean) userVerification.get("hasVerifiedIdentity");
            
            if (hasVerifiedLicense == null || !hasVerifiedLicense) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn cần xác thực Giấy phép lái xe (GPLX) trước khi đặt xe.");
            }
            
            if (hasVerifiedIdentity == null || !hasVerifiedIdentity) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn cần xác thực Căn cước công dân (CCCD) trước khi đặt xe.");
            }
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi kiểm tra trạng thái xác thực: " + e.getMessage());
        }

        // --- BƯỚC 2.5: LẤY THÔNG TIN XE ĐỂ TÍNH GIÁ ---
        VehicleDTO vehicleInfo;
        try {
            vehicleInfo = restTemplate.getForObject(
                vehicleServiceUrl + "/api/vehicles/" + request.getVehicleId(),
                VehicleDTO.class
            );
            if (vehicleInfo == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin xe");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi lấy thông tin xe: " + e.getMessage());
        }

        // Tính tổng chi phí dự kiến
        long minutes = Duration.between(estimatedStartTime, estimatedEndTime).toMinutes();
        long hours = (long) Math.ceil(minutes / 60.0);
        BigDecimal totalCost = BigDecimal.valueOf(hours).multiply(BigDecimal.valueOf(vehicleInfo.getPricePerHour()));

        // --- BƯỚC 3: TẠO BOOKING MỚI ---
        Booking booking = Booking.builder()
                .userId(userId)
                .vehicleId(request.getVehicleId())
                .startStationId(request.getStartStationId())
                .bookingTime(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")))
                .estimatedStartTime(estimatedStartTime)
                .estimatedEndTime(estimatedEndTime)
                .bookingType(request.getBookingType() != null ? request.getBookingType() : Booking.BookingType.ADVANCE)
                .status(Booking.BookingStatus.PENDING) // Luôn PENDING, chờ staff xác nhận
                .totalCost(totalCost) // Thêm tổng chi phí dự kiến
                .build();
                
        Booking savedBooking = bookingRepository.save(booking);

        // --- BƯỚC 4: GỌI API CẬP NHẬT VEHICLE-SERVICE ---
        restTemplate.put(
            vehicleServiceUrl + "/api/vehicles/" + request.getVehicleId() + "/status/RENTED",
            null
        );
        
        // --- BƯỚC 5: GỬI THÔNG BÁO ĐẾN STAFF QUA RABBITMQ ---
        try {
            // Lấy thông tin user để gửi thông báo
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> userInfo = restTemplate.getForObject(
                userServiceUrl + "/api/users/" + userId,
                java.util.Map.class
            );
            
            // Lấy thông tin station để gửi đến đúng staff
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> stationInfo = restTemplate.getForObject(
                "http://vehicle-service:8080/api/stations/" + request.getStartStationId(),
                java.util.Map.class
            );
            
            String customerName = userInfo != null ? (String) userInfo.get("fullName") : "Khách hàng";
            String customerPhone = userInfo != null ? (String) userInfo.get("phoneNumber") : "";
            String customerEmail = userInfo != null ? (String) userInfo.get("email") : "";
            String stationName = stationInfo != null ? (String) stationInfo.get("name") : "";
            String stationAddress = stationInfo != null ? (String) stationInfo.get("address") : "";
            
            // Tạo thông báo chi tiết
            StaffNotificationDTO notification = StaffNotificationDTO.builder()
                .bookingId(savedBooking.getId())
                .userId(userId)
                .vehicleId(request.getVehicleId())
                .stationId(request.getStartStationId())
                .customerName(customerName)
                .customerPhone(customerPhone)
                .customerEmail(customerEmail)
                .vehicleModel(vehicle.getType())
                .vehiclePlate(vehicle.getLicensePlate())
                .estimatedStartTime(estimatedStartTime)
                .estimatedEndTime(estimatedEndTime)
                .bookingTime(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")))
                .notificationType("NEW_BOOKING")
                .stationName(stationName)
                .stationAddress(stationAddress)
                .message(String.format("Có yêu cầu đặt xe mới từ khách hàng %s (%s). Xe: %s - %s. Thời gian nhận dự kiến: %s tại trạm %s", 
                    customerName, customerPhone, vehicle.getType(), vehicle.getLicensePlate(), 
                    estimatedStartTime, stationName))
                .build();
            
            notificationService.sendStaffNotification(notification);
        } catch (Exception e) {
            // Log lỗi nhưng không ảnh hưởng đến việc tạo booking
            System.err.println("Lỗi khi gửi thông báo đến staff: " + e.getMessage());
        }
        
        // --- BƯỚC 6: THIẾT LẬP COUNTDOWN TIMER CHO BOOKING ---
        try {
            // Chỉ thiết lập countdown cho booking đặt trước (ADVANCE) đã CONFIRMED
            if (savedBooking.getBookingType() == Booking.BookingType.ADVANCE && 
                savedBooking.getStatus() == Booking.BookingStatus.CONFIRMED) {
                bookingTimeoutService.setupBookingDeadline(savedBooking);
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi thiết lập countdown timer: " + e.getMessage());
        }
        
        return savedBooking;
    }

    @Override
    public Booking checkIn(Long bookingId, CheckInRequest request) {
        // (Chức năng 1.c / 2.a)
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking không tìm thấy"));

        if (booking.getStatus() != Booking.BookingStatus.PENDING && 
            booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Booking phải ở trạng thái PENDING hoặc CONFIRMED để có thể bàn giao");
        }
        
        // Kiểm tra thời gian cho phép bàn giao (30 phút trước thời gian nhận xe)
        if (!bookingTimeoutService.canCheckIn(booking)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Chưa đến thời gian bàn giao xe. Vui lòng chờ đến 30 phút trước thời gian nhận xe đã đặt");
        }
        
        // Cập nhật trạng thái booking
        booking.setStatus(Booking.BookingStatus.ACTIVE);
        booking.setActualStartTime(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
        
        // Cập nhật ảnh xe và ảnh bằng lái
        booking.setCheckinVehicleImageUrl(request.getCheckinVehicleImageUrl());
        booking.setCustomerLicenseImageUrl(request.getCustomerLicenseImageUrl());
        booking.setStaffVerifiedCustomer(request.getStaffVerifiedCustomer());
        
        BookingContract contract = BookingContract.builder()
                .booking(booking)
                .termsAndConditions("Điều khoản tiêu chuẩn...")
                .renterSignature(request.getRenterSignature())
                .staffSignature(request.getStaffSignature())
                .checkinVehicleImageUrl(request.getCheckinVehicleImageUrl())
                .signedAt(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")))
                .build();
        
        contractRepository.save(contract);
        
        booking.setContract(contract);
        return bookingRepository.save(booking);
    }

    @Override
    public Booking checkOut(Long bookingId, CheckOutRequest request) {
        // (Chức năng 1.d / 2.a)
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking không tìm thấy"));

        if (booking.getStatus() != Booking.BookingStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking không ở trạng thái ACTIVE");
        }
        
        // 1. Lấy thông tin xe để tính tiền
        VehicleDTO vehicle = restTemplate.getForObject(
            vehicleServiceUrl + "/api/vehicles/" + booking.getVehicleId(),
            VehicleDTO.class
        );
        if (vehicle == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể lấy thông tin xe");
        }

        // 2. Tính toán chi phí (Logic 1.d)
        LocalDateTime startTime = booking.getActualStartTime();
        LocalDateTime endTime = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        long minutes = Duration.between(startTime, endTime).toMinutes();
        long hours = (long) Math.ceil(minutes / 60.0);
        BigDecimal totalCost = BigDecimal.valueOf(hours * vehicle.getPricePerHour());

        // 3. Cập nhật Booking
        booking.setStatus(Booking.BookingStatus.COMPLETED);
        
        // Sử dụng thời gian từ request hoặc thời gian hiện tại
        LocalDateTime finalEndTime = (request.getActualEndTime() != null) 
            ? request.getActualEndTime() 
            : endTime;
        booking.setActualEndTime(finalEndTime);
        
        booking.setEndStationId(request.getEndStationId());
        booking.setCheckoutVehicleImageUrl(request.getCheckoutVehicleImageUrl());
        booking.setVehicleConditionNotes(request.getVehicleConditionNotes());
        booking.setTotalCost(totalCost);
        
        Booking savedBooking = bookingRepository.save(booking);
        
        // 4. GỌI API CẬP NHẬT VEHICLE-SERVICE (Trả xe về AVAILABLE)
        restTemplate.put(
            vehicleServiceUrl + "/api/vehicles/" + booking.getVehicleId() + "/status/AVAILABLE",
            null
        );
        
        // --- 5. TÍCH HỢP MỚI: GỌI SANG PAYMENT-SERVICE ---
        // (Xóa TODO và triển khai thật)
        if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
            PaymentRequestDTO paymentRequest = new PaymentRequestDTO(
                savedBooking.getUserId(),
                savedBooking.getId(),
                savedBooking.getTotalCost(),
                "BOOKING_PAYMENT", // TransactionType
                "CASH_AT_STATION"  // (Giả sử Staff thu tiền mặt tại quầy)
            );
            
            try {
                // Gọi API POST sang payment-service
                restTemplate.postForObject(
                    paymentServiceUrl + "/api/payments", 
                    paymentRequest, 
                    String.class // (Chỉ cần biết nó chạy, không cần kết quả)
                );
            } catch (Exception e) {
                // Nếu payment-service bị lỗi, chúng ta không dừng lại,
                // nhưng chúng ta CẦN log lỗi này lại.
                System.err.println("CRITICAL: Booking " + savedBooking.getId() + " đã hoàn thành nhưng GHI LẠI THANH TOÁN thất bại: " + e.getMessage());
            }
        }
        // --------------------------------------------------

        return savedBooking;
    }

    @Override
    public List<Booking> getMyHistory(Long userId) {
        // (Chức năng 1.e)
        return bookingRepository.findByUserIdOrderByBookingTimeDesc(userId);
    }

    @Override
    public List<Booking> getStationBookings(Long stationId) {
        // (Chức năng 2.a)
        return bookingRepository.findByStartStationIdOrderByBookingTimeDesc(stationId);
    }

    @Override
    public List<Booking> getBookingsByUserId(Long userId) {
        // (Chức năng 3.a)
        return bookingRepository.findByUserIdOrderByBookingTimeDesc(userId);
    }
    
    @Override
    public List<BookingResponseDTO> getUserBookingsWithDetails(Long userId) {
        // Lấy tất cả bookings của user
        List<Booking> bookings = bookingRepository.findByUserIdOrderByBookingTimeDesc(userId);
        
        // Convert sang DTO và enrich với user/vehicle info
        return bookings.stream().map(booking -> {
            BookingResponseDTO dto = BookingResponseDTO.fromBooking(booking);
            
            // Fetch user info từ user-service
            try {
                BookingResponseDTO.UserInfo userInfo = externalApiService.getUserInfo(booking.getUserId());
                dto.setUserInfo(userInfo);
            } catch (Exception e) {
                System.err.println("Lỗi khi lấy user info: " + e.getMessage());
            }
            
            // Fetch vehicle info từ vehicle-service
            try {
                BookingResponseDTO.VehicleInfo vehicleInfo = externalApiService.getVehicleInfo(booking.getVehicleId());
                dto.setVehicleInfo(vehicleInfo);
            } catch (Exception e) {
                System.err.println("Lỗi khi lấy vehicle info: " + e.getMessage());
            }
            
            return dto;
        }).collect(Collectors.toList());
    }
    
    @Override
    public List<Long> getBookedVehicleIds(LocalDateTime startTime, LocalDateTime endTime) {
        // Lấy danh sách vehicleId đã được booking trong khoảng thời gian
        return bookingRepository.findBookedVehicleIds(startTime, endTime);
    }
    
    @Override
    public List<Booking> getPendingBookingsByStation(Long stationId) {
        // Lấy các booking đang chờ xử lý tại trạm (status = PENDING)
        return bookingRepository.findByStartStationIdAndStatusOrderByBookingTimeAsc(stationId, Booking.BookingStatus.PENDING);
    }
    
    @Override
    public List<BookingResponseDTO> getPendingBookingsWithDetailsForStation(Long stationId) {
        // Lấy các booking đang CHỜ XÁC NHẬN tại trạm (status = PENDING)
        // Sau khi staff xác nhận thì booking sẽ chuyển sang CONFIRMED
        List<Booking> pendingBookings = bookingRepository.findByStartStationIdAndStatusOrderByBookingTimeAsc(stationId, Booking.BookingStatus.PENDING);
        
        // Convert sang DTO và enrich với user/vehicle info
        return pendingBookings.stream().map(booking -> {
            BookingResponseDTO dto = BookingResponseDTO.fromBooking(booking);
            
            // Fetch user info từ user-service
            BookingResponseDTO.UserInfo userInfo = externalApiService.getUserInfo(booking.getUserId());
            dto.setUserInfo(userInfo);
            
            // Fetch vehicle info từ vehicle-service
            BookingResponseDTO.VehicleInfo vehicleInfo = externalApiService.getVehicleInfo(booking.getVehicleId());
            dto.setVehicleInfo(vehicleInfo);
            
            return dto;
        }).collect(Collectors.toList());
    }
    
    @Override
    public List<BookingResponseDTO> getActiveBookingsWithDetailsForStation(Long stationId) {
        // Lấy các booking ACTIVE cần nhận xe tại trạm
        // Sử dụng startStationId thay vì endStationId vì endStationId có thể null
        List<Booking> activeBookings = bookingRepository.findByStartStationIdAndStatusOrderByActualStartTimeAsc(
            stationId, Booking.BookingStatus.ACTIVE);
        
        // Convert sang DTO và enrich với user/vehicle info
        return activeBookings.stream().map(booking -> {
            BookingResponseDTO dto = BookingResponseDTO.fromBooking(booking);
            
            // Fetch user info từ user-service
            BookingResponseDTO.UserInfo userInfo = externalApiService.getUserInfo(booking.getUserId());
            dto.setUserInfo(userInfo);
            
            // Fetch vehicle info từ vehicle-service
            BookingResponseDTO.VehicleInfo vehicleInfo = externalApiService.getVehicleInfo(booking.getVehicleId());
            dto.setVehicleInfo(vehicleInfo);
            
            return dto;
        }).collect(Collectors.toList());
    }
    
    @Override
    public BookingTimeoutService.BookingCountdownDTO getBookingCountdown(Long bookingId) {
        return bookingTimeoutService.getBookingCountdown(bookingId);
    }
    
    @Override
    public Booking confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking không tìm thấy"));
        
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Chỉ có thể xác nhận booking đang ở trạng thái PENDING");
        }
        
        // Cập nhật trạng thái thành CONFIRMED
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        Booking confirmedBooking = bookingRepository.save(booking);
        
        // Gửi thông báo cho user
        try {
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> userInfo = restTemplate.getForObject(
                userServiceUrl + "/api/users/" + booking.getUserId(),
                java.util.Map.class
            );
            
            String customerName = userInfo != null ? (String) userInfo.get("fullName") : "Khách hàng";
            String customerPhone = userInfo != null ? (String) userInfo.get("phoneNumber") : "";
            
            // TODO: Gửi notification cho user qua email/SMS
            System.out.println("Thông báo cho khách hàng " + customerName + " (" + customerPhone + "): Booking #" + bookingId + " đã được xác nhận!");
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi thông báo cho user: " + e.getMessage());
        }
        
        return confirmedBooking;
    }
    
    @Override
    public Booking rejectBooking(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking không tìm thấy"));
        
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Chỉ có thể từ chối booking đang ở trạng thái PENDING");
        }
        
        // Cập nhật trạng thái thành CANCELLED
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Booking rejectedBooking = bookingRepository.save(booking);
        
        // Cập nhật lại trạng thái xe về AVAILABLE
        try {
            restTemplate.put(
                vehicleServiceUrl + "/api/vehicles/" + booking.getVehicleId() + "/status/AVAILABLE",
                null
            );
        } catch (Exception e) {
            System.err.println("Lỗi khi cập nhật trạng thái xe: " + e.getMessage());
        }
        
        // Gửi thông báo cho user
        try {
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> userInfo = restTemplate.getForObject(
                userServiceUrl + "/api/users/" + booking.getUserId(),
                java.util.Map.class
            );
            
            String customerName = userInfo != null ? (String) userInfo.get("fullName") : "Khách hàng";
            String customerPhone = userInfo != null ? (String) userInfo.get("phoneNumber") : "";
            String rejectReason = reason != null && !reason.isEmpty() ? reason : "Không có lý do cụ thể";
            
            // TODO: Gửi notification cho user qua email/SMS
            System.out.println("Thông báo cho khách hàng " + customerName + " (" + customerPhone + "): Booking #" + bookingId + " đã bị từ chối. Lý do: " + rejectReason);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi thông báo cho user: " + e.getMessage());
        }
        
        return rejectedBooking;
    }
    
    @Override
    public Booking createWalkInBooking(
            Long vehicleId,
            Long stationId,
            Long staffId,
            String fullName,
            String phoneNumber,
            String email,
            LocalDateTime startDate,
            LocalDateTime endDate,
            org.springframework.web.multipart.MultipartFile gplxImage,
            org.springframework.web.multipart.MultipartFile cccdImage) {
        
        // 1. Kiểm tra xe có sẵn không
        try {
            ResponseEntity<String> vehicleStatusResponse = restTemplate.getForEntity(
                vehicleServiceUrl + "/api/vehicles/" + vehicleId + "/status",
                String.class
            );
            
            String vehicleStatus = vehicleStatusResponse.getBody();
            if (!"AVAILABLE".equals(vehicleStatus)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Xe không có sẵn để đặt. Trạng thái hiện tại: " + vehicleStatus);
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Không thể kiểm tra trạng thái xe: " + e.getMessage());
        }
        
        // 2. Lấy thông tin xe để tính giá
        BookingResponseDTO.VehicleInfo vehicleInfo;
        try {
            vehicleInfo = externalApiService.getVehicleInfo(vehicleId);
            if (vehicleInfo == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin xe");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Không thể lấy thông tin xe: " + e.getMessage());
        }
        
        // 3. Tính toán tổng tiền
        long durationHours = java.time.Duration.between(startDate, endDate).toHours();
        if (durationHours <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Ngày trả xe phải sau ngày nhận xe!");
        }
        
        BigDecimal totalCost = BigDecimal.valueOf(durationHours)
            .multiply(vehicleInfo.getPricePerHour());
        
        // 4. Tạo booking mới với bookingType = WALK_IN
        Booking walkInBooking = new Booking();
        walkInBooking.setUserId(null); // Walk-in không có userId (khách vãng lai)
        walkInBooking.setVehicleId(vehicleId);
        walkInBooking.setStartStationId(stationId);
        walkInBooking.setEndStationId(stationId); // Trả lại tại cùng trạm
        walkInBooking.setEstimatedStartTime(startDate);
        walkInBooking.setEstimatedEndTime(endDate);
        walkInBooking.setBookingTime(LocalDateTime.now());
        walkInBooking.setTotalCost(totalCost);
        walkInBooking.setStatus(Booking.BookingStatus.CONFIRMED); // Walk-in được confirm luôn
        walkInBooking.setBookingType(Booking.BookingType.WALK_IN);
        
        // Lưu thông tin khách hàng walk-in
        walkInBooking.setCustomerName(fullName);
        walkInBooking.setCustomerPhone(phoneNumber);
        walkInBooking.setCustomerEmail(email);
        
        // 5. Upload ảnh GPLX và CCCD
        String gplxUrl = null;
        String cccdUrl = null;
        
        if (gplxImage != null && !gplxImage.isEmpty()) {
            try {
                gplxUrl = uploadLicenseImage(null, gplxImage, "GPLX");
                walkInBooking.setGplxImageUrl(gplxUrl);
            } catch (Exception e) {
                System.err.println("Lỗi khi upload ảnh GPLX: " + e.getMessage());
            }
        }
        
        if (cccdImage != null && !cccdImage.isEmpty()) {
            try {
                cccdUrl = uploadLicenseImage(null, cccdImage, "CCCD");
                walkInBooking.setCccdImageUrl(cccdUrl);
            } catch (Exception e) {
                System.err.println("Lỗi khi upload ảnh CCCD: " + e.getMessage());
            }
        }
        
        // 5.5. Tạo hoặc cập nhật thông tin khách hàng walk-in
        try {
            com.evrental.booking.model.WalkInCustomer customer = walkInCustomerService.findOrCreateCustomer(
                fullName,
                phoneNumber,
                email,
                gplxUrl,
                cccdUrl,
                stationId
            );
            walkInBooking.setWalkInCustomerId(customer.getId());
        } catch (Exception e) {
            System.err.println("Lỗi khi lưu thông tin khách hàng walk-in: " + e.getMessage());
            // Không rollback, vẫn cho phép đặt xe
        }
        
        // 6. Lưu booking vào database
        Booking savedBooking = bookingRepository.save(walkInBooking);
        
        // 6.5. Cập nhật thống kê booking cho khách hàng
        if (walkInBooking.getWalkInCustomerId() != null) {
            try {
                walkInCustomerService.updateBookingStats(walkInBooking.getWalkInCustomerId());
            } catch (Exception e) {
                System.err.println("Lỗi khi cập nhật thống kê khách hàng: " + e.getMessage());
            }
        }
        
        // 7. Cập nhật trạng thái xe thành RENTED
        try {
            restTemplate.put(
                vehicleServiceUrl + "/api/vehicles/" + vehicleId + "/status/RENTED",
                null
            );
        } catch (Exception e) {
            System.err.println("Lỗi khi cập nhật trạng thái xe: " + e.getMessage());
            // Rollback nếu không update được xe
            bookingRepository.delete(savedBooking);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Không thể cập nhật trạng thái xe");
        }
        
        // 8. Gửi thông báo cho staff
        System.out.println("✅ Walk-in booking created by staff #" + staffId + 
            " - Customer: " + fullName + " (" + phoneNumber + ")");
        
        return savedBooking;
    }
    
    // Helper method để upload license images to MinIO
    private String uploadLicenseImage(Long bookingId, 
            org.springframework.web.multipart.MultipartFile file, 
            String type) {
        try {
            // Upload to MinIO with folder structure: licenses/{type}/
            String folder = "licenses/" + type.toLowerCase();
            return minioService.uploadFile(file, folder);
        } catch (Exception e) {
            System.err.println("Error uploading " + type + " image to MinIO: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    @Override
    public Page<BookingResponseDTO> getAllBookingsForAdmin(Pageable pageable, String status, Long stationId, Long userId, Long vehicleId, LocalDateTime startDate, LocalDateTime endDate, String search) {
        System.out.println("📋 BookingService getAllBookingsForAdmin called with filters:");
        System.out.println("  - status: " + status);
        System.out.println("  - stationId: " + stationId);
        System.out.println("  - search: " + search);
        
        // Lấy tất cả booking
        List<Booking> allBookings = bookingRepository.findAll();
        System.out.println("📊 Total bookings in database: " + allBookings.size());
        
        // Convert sang DTO trước để dễ làm việc
        List<BookingResponseDTO> allBookingDTOs = allBookings.stream()
            .map(BookingResponseDTO::fromBooking)
            .collect(Collectors.toList());
        
        System.out.println("📊 Total booking DTOs created: " + allBookingDTOs.size());
        
        // Apply filters on DTOs
        List<BookingResponseDTO> filteredBookingDTOs = allBookingDTOs;
        
        // Filter theo status
        if (status != null && !status.trim().isEmpty()) {
            filteredBookingDTOs = filteredBookingDTOs.stream()
                .filter(dto -> dto.getStatus() != null && dto.getStatus().name().equals(status))
                .collect(Collectors.toList());
            System.out.println("📊 After status filter (" + status + "): " + filteredBookingDTOs.size());
        }
        
        // Filter theo stationId 
        if (stationId != null) {
            filteredBookingDTOs = filteredBookingDTOs.stream()
                .filter(dto -> stationId.equals(dto.getStartStationId()))
                .collect(Collectors.toList());
            System.out.println("📊 After station filter (" + stationId + "): " + filteredBookingDTOs.size());
        }
        
        // Filter theo startDate
        if (startDate != null) {
            filteredBookingDTOs = filteredBookingDTOs.stream()
                .filter(dto -> dto.getBookingTime() != null && !dto.getBookingTime().isBefore(startDate))
                .collect(Collectors.toList());
            System.out.println("📊 After startDate filter (" + startDate + "): " + filteredBookingDTOs.size());
        }
        
        // Filter theo endDate
        if (endDate != null) {
            filteredBookingDTOs = filteredBookingDTOs.stream()
                .filter(dto -> dto.getBookingTime() != null && !dto.getBookingTime().isAfter(endDate))
                .collect(Collectors.toList());
            System.out.println("📊 After endDate filter (" + endDate + "): " + filteredBookingDTOs.size());
        }
        
        // Áp dụng phân trang
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredBookingDTOs.size());
        
        List<BookingResponseDTO> pageBookingDTOs = start < filteredBookingDTOs.size() 
            ? filteredBookingDTOs.subList(start, end) 
            : List.of();
        
        System.out.println("📄 Page result: " + pageBookingDTOs.size() + " items (offset: " + start + ", total filtered: " + filteredBookingDTOs.size() + ")");
        
        return new PageImpl<>(pageBookingDTOs, pageable, filteredBookingDTOs.size());
    }

}

