package com.evrental.booking.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateBookingRequest {
    
    private Long userId; // <-- THÊM DÒNG NÀY (Tạm thời)
    
    private Long vehicleId;
    private Long startStationId;
    
    private LocalDateTime estimatedStartTime;
    private LocalDateTime estimatedEndTime;
}