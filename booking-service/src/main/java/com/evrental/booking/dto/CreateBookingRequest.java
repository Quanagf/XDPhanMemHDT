package com.evrental.booking.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import com.evrental.booking.model.Booking;

@Data
public class CreateBookingRequest {
    
    private Long vehicleId;
    private Long startStationId;
    private Long endStationId; // Optional: có thể null cho đến khi người dùng trả xe
    private String estimatedStartTime; // Format: "yyyy-MM-dd HH:mm:ss"
    private String estimatedEndTime;   // Format: "yyyy-MM-dd HH:mm:ss" - Optional, sẽ mặc định cuối ngày
    
    // Loại đặt xe - mặc định là đặt trước
    private Booking.BookingType bookingType = Booking.BookingType.ADVANCE;
    
    /**
     * Chuyển đổi estimatedStartTime từ String sang LocalDateTime
     * @return LocalDateTime hoặc null nếu không có giá trị
     */
    public LocalDateTime getEstimatedStartTimeAsLocalDateTime() {
        if (estimatedStartTime == null || estimatedStartTime.trim().isEmpty()) {
            return null;
        }
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            return LocalDateTime.parse(estimatedStartTime, formatter);
        } catch (Exception e) {
            throw new IllegalArgumentException("Thời gian nhận xe không hợp lệ. Định dạng yêu cầu: yyyy-MM-dd HH:mm:ss");
        }
    }
    
    /**
     * Chuyển đổi estimatedEndTime từ String sang LocalDateTime
     * Nếu không có, mặc định là 23:00:00 của ngày được chọn trong estimatedStartTime
     * @return LocalDateTime
     */
    public LocalDateTime getEstimatedEndTimeAsLocalDateTime() {
        // Nếu có estimatedEndTime, parse nó
        if (estimatedEndTime != null && !estimatedEndTime.trim().isEmpty()) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                return LocalDateTime.parse(estimatedEndTime, formatter);
            } catch (Exception e) {
                throw new IllegalArgumentException("Thời gian trả xe không hợp lệ. Định dạng yêu cầu: yyyy-MM-dd HH:mm:ss");
            }
        }
        
        // Nếu không có, mặc định là 23:00 của ngày trong estimatedStartTime
        LocalDateTime startTime = getEstimatedStartTimeAsLocalDateTime();
        if (startTime != null) {
            // Mặc định trả xe vào 23:00:00 của ngày bắt đầu thuê
            return startTime.toLocalDate().atTime(LocalTime.of(23, 0, 0));
        }
        
        return null;
    }
}