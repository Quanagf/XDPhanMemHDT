package com.evrental.booking.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateBookingRequest {
    
    
    private Long vehicleId;
    private Long startStationId;
    
    private LocalDateTime estimatedStartTime;
    private LocalDateTime estimatedEndTime;
}