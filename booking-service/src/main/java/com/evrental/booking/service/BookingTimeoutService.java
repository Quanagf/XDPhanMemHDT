package com.evrental.booking.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.evrental.booking.model.Booking;
import com.evrental.booking.repository.BookingRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingTimeoutService {

    private final BookingRepository bookingRepository;
    private final RestTemplate restTemplate;
    private final NotificationService notificationService;

    // Cấu hình thời gian timeout (có thể điều chỉnh theo nghiệp vụ)
    private static final int EARLY_CHECKIN_MINUTES = 30;  // Cho phép bàn giao sớm 30 phút
    private static final int LATE_CANCEL_MINUTES = 10;    // Tự động hủy nếu trễ 10 phút

    /**
     * Chạy mỗi phút để kiểm tra và hủy các booking hết hạn
     */
    @Scheduled(fixedRate = 60000) // Chạy mỗi 60 giây
    public void checkAndCancelExpiredBookings() {
        log.info("Checking for expired bookings...");
        
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        
        // Tìm các booking đang chờ (CONFIRMED) và đã hết hạn
        List<Booking> expiredBookings = bookingRepository.findExpiredBookings(now);
        
        for (Booking booking : expiredBookings) {
            try {
                // Hủy booking và chuyển xe về trạng thái AVAILABLE
                cancelExpiredBooking(booking);
                log.info("Cancelled expired booking #{} for vehicle #{}", 
                        booking.getId(), booking.getVehicleId());
            } catch (Exception e) {
                log.error("Failed to cancel expired booking #{}: {}", 
                         booking.getId(), e.getMessage());
            }
        }
    }

    /**
     * Thiết lập deadline cho booking mới
     */
    public void setupBookingDeadline(Booking booking) {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        LocalDateTime pickupTime = booking.getEstimatedStartTime();
        
        // Deadline = pickup time + 10 phút (sau đó sẽ tự động hủy)
        LocalDateTime deadline = pickupTime.plusMinutes(LATE_CANCEL_MINUTES);
        
        // Tính timeout minutes từ thời điểm đặt đến deadline
        long timeoutMinutes = ChronoUnit.MINUTES.between(now, deadline);
        
        booking.setCountdownStartTime(now);
        booking.setHandoverDeadline(deadline);
        booking.setHandoverTimeoutMinutes((int) timeoutMinutes);
        
        bookingRepository.save(booking);
        
        log.info("Set up countdown for booking #{}: {} minutes until auto-cancel deadline. Pickup: {}, Deadline: {}", 
                booking.getId(), timeoutMinutes, pickupTime, deadline);
    }

    /**
     * Kiểm tra xem booking có thể bàn giao không
     * Cho phép bàn giao từ 30 phút trước thời gian nhận xe
     */
    public boolean canCheckIn(Booking booking) {
        if (booking.getEstimatedStartTime() == null) {
            return false;
        }
        
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        LocalDateTime pickupTime = booking.getEstimatedStartTime();
        LocalDateTime earlyCheckInTime = pickupTime.minusMinutes(EARLY_CHECKIN_MINUTES);
        
        // Có thể check-in từ 30 phút trước đến 10 phút sau thời gian nhận xe
        boolean isAfterEarlyTime = now.isAfter(earlyCheckInTime) || now.isEqual(earlyCheckInTime);
        boolean isBeforeDeadline = now.isBefore(booking.getHandoverDeadline());
        
        log.debug("Check-in validation for booking #{}: now={}, pickupTime={}, earlyTime={}, deadline={}, canCheckIn={}", 
                booking.getId(), now, pickupTime, earlyCheckInTime, booking.getHandoverDeadline(), 
                isAfterEarlyTime && isBeforeDeadline);
        
        return isAfterEarlyTime && isBeforeDeadline;
    }

    /**
     * Tính số phút còn lại đến deadline
     */
    public long calculateRemainingMinutes(Booking booking) {
        if (booking.getHandoverDeadline() == null) {
            return -1; // Không có deadline
        }
        
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        if (now.isAfter(booking.getHandoverDeadline())) {
            return 0; // Đã hết hạn
        }
        
        return ChronoUnit.MINUTES.between(now, booking.getHandoverDeadline());
    }

    /**
     * Hủy booking đã hết hạn
     */
    private void cancelExpiredBooking(Booking booking) {
        // Cập nhật status booking
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setTimeoutCancelled(true);
        bookingRepository.save(booking);

        // Gọi vehicle-service để chuyển xe về AVAILABLE
        String vehicleServiceUrl = "http://vehicle-service:8082"; // URL của vehicle service
        try {
            restTemplate.put(
                vehicleServiceUrl + "/api/vehicles/" + booking.getVehicleId() + "/status/AVAILABLE",
                null
            );
            log.info("Vehicle #{} status updated to AVAILABLE after booking timeout", 
                    booking.getVehicleId());
        } catch (Exception e) {
            log.error("Failed to update vehicle #{} status: {}", 
                     booking.getVehicleId(), e.getMessage());
        }

        // Gửi thông báo đến staff về việc hủy booking
        try {
            // TODO: Implement notification logic
            log.info("Should send cancellation notification for booking #{}", booking.getId());
        } catch (Exception e) {
            log.error("Failed to send cancellation notification: {}", e.getMessage());
        }
    }

    /**
     * Lấy thông tin countdown cho frontend
     */
    public BookingCountdownDTO getBookingCountdown(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null) {
            return null;
        }

        long remainingMinutes = calculateRemainingMinutes(booking);
        boolean isExpired = remainingMinutes <= 0;
        
        return BookingCountdownDTO.builder()
                .bookingId(bookingId)
                .remainingMinutes(remainingMinutes)
                .deadlineTime(booking.getHandoverDeadline())
                .isExpired(isExpired)
                .timeoutMinutes(booking.getHandoverTimeoutMinutes())
                .bookingType(booking.getBookingType())
                .build();
    }

    /**
     * DTO cho countdown info
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class BookingCountdownDTO {
        private Long bookingId;
        private long remainingMinutes;
        private LocalDateTime deadlineTime;
        private boolean isExpired;
        private Integer timeoutMinutes;
        private Booking.BookingType bookingType;
    }
}