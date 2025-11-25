package com.evrental.booking.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import com.evrental.booking.model.Booking;

@Data
public class CreateBookingRequest {
    
    private Long vehicleId;
    private Long startStationId;
    private Long endStationId; // Optional: có thể null cho đến khi người dùng trả xe
    private String estimatedStartTime; // Changed to String for custom parsing
    private String estimatedEndTime;   // Changed to String for custom parsing
    
    // Loại đặt xe - mặc định là đặt trước
    private Booking.BookingType bookingType = Booking.BookingType.ADVANCE;
    
    // Helper methods to convert String to LocalDateTime
    public LocalDateTime getEstimatedStartTimeAsLocalDateTime() {
        if (estimatedStartTime == null) return null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return LocalDateTime.parse(estimatedStartTime, formatter);
    }
    
    public LocalDateTime getEstimatedEndTimeAsLocalDateTime() {
        if (estimatedEndTime == null) return null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return LocalDateTime.parse(estimatedEndTime, formatter);
    }
}