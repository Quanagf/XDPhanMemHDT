package com.evrental.booking.dto;

import lombok.Data;

// Đây là một DTO "stub" (giả)
// Nó chỉ chứa các trường mà booking-service QUAN TÂM
// từ vehicle-service
@Data
public class VehicleDTO {
    private Long id;
    private String licensePlate;
    private String type;
    private Double pricePerHour;
    private VehicleStatus status;
    private Long stationId;
    
    public enum VehicleStatus {
        AVAILABLE,
        RENTED,
        MAINTENANCE
    }
}