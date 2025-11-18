package com.evrental.booking.service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value; // <-- DÒNG MỚI (Import DTO để gửi đi)
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.evrental.booking.dto.CheckInRequest;
import com.evrental.booking.dto.CheckOutRequest;
import com.evrental.booking.dto.CreateBookingRequest;
import com.evrental.booking.dto.PaymentRequestDTO;
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

    // Lấy URL của service khác từ application.properties
    @Value("${service.url.vehicles}")
    private String vehicleServiceUrl;
    
    @Value("${service.url.users}")
    private String userServiceUrl;
    
    @Value("${service.url.payment}") // <-- DÒNG MỚI (Inject URL của payment-service)
    private String paymentServiceUrl;

    @Override
    public Booking createBooking(CreateBookingRequest request, Long userId) {
        
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

        // --- BƯỚC 3: TẠO BOOKING MỚI ---
        Booking booking = Booking.builder()
                .userId(userId)
                .vehicleId(request.getVehicleId())
                .startStationId(request.getStartStationId())
                .bookingTime(LocalDateTime.now())
                .estimatedStartTime(request.getEstimatedStartTime())
                .estimatedEndTime(request.getEstimatedEndTime())
                .status(Booking.BookingStatus.PENDING)
                .build();
                
        Booking savedBooking = bookingRepository.save(booking);

        // --- BƯỚC 4: GỌI API CẬP NHẬT VEHICLE-SERVICE ---
        restTemplate.put(
            vehicleServiceUrl + "/api/vehicles/" + request.getVehicleId() + "/status/RENTED",
            null
        );
        
        return savedBooking;
    }

    @Override
    public Booking checkIn(Long bookingId, CheckInRequest request) {
        // (Chức năng 1.c / 2.a)
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking không tìm thấy"));

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking không ở trạng thái PENDING");
        }
        
        booking.setStatus(Booking.BookingStatus.ACTIVE);
        booking.setActualStartTime(LocalDateTime.now());
        
        BookingContract contract = BookingContract.builder()
                .booking(booking)
                .termsAndConditions("Điều khoản tiêu chuẩn...")
                .renterSignature(request.getRenterSignature())
                .staffSignature(request.getStaffSignature())
                .checkinVehicleImageUrl(request.getCheckinVehicleImageUrl())
                .signedAt(LocalDateTime.now())
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
        LocalDateTime endTime = LocalDateTime.now();
        long minutes = Duration.between(startTime, endTime).toMinutes();
        long hours = (long) Math.ceil(minutes / 60.0);
        BigDecimal totalCost = BigDecimal.valueOf(hours * vehicle.getPricePerHour());

        // 3. Cập nhật Booking
        booking.setStatus(Booking.BookingStatus.COMPLETED);
        booking.setActualEndTime(endTime);
        booking.setEndStationId(request.getEndStationId());
        booking.setCheckoutVehicleImageUrl(request.getCheckoutVehicleImageUrl());
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
        // TODO: Cần 1 câu query phức tạp hơn
        return List.of(); 
    }

    @Override
    public List<Booking> getBookingsByUserId(Long userId) {
        // (Chức năng 3.a)
        return bookingRepository.findByUserIdOrderByBookingTimeDesc(userId);
    }
    
    @Override
    public List<Long> getBookedVehicleIds(LocalDateTime startTime, LocalDateTime endTime) {
        // Lấy danh sách vehicleId đã được booking trong khoảng thời gian
        return bookingRepository.findBookedVehicleIds(startTime, endTime);
    }
    
}
