package com.evrental.users.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffNotificationDTO {
    
    private Long bookingId;
    private Long userId;
    private Long vehicleId;
    private Long stationId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String vehicleModel;
    private String vehiclePlate;
    private LocalDateTime estimatedStartTime;
    private LocalDateTime estimatedEndTime;
    private LocalDateTime bookingTime;
    private String notificationType; // "NEW_BOOKING", "BOOKING_CANCELLED", etc.
    private String message;
    
    // Thông tin trạm để routing
    private String stationName;
    private String stationAddress;
}