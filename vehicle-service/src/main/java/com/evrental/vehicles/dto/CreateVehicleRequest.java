package com.evrental.vehicles.dto;

import com.evrental.vehicles.model.Vehicle;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateVehicleRequest {
    // Thông tin xe
    private String licensePlate;
    private String type;
    private Integer batteryLevel;
    private Double pricePerHour;
    private Vehicle.VehicleStatus status;
    
    // Thuộc tính mới
    private String imageUrl;
    private String description;
    private LocalDate lastMaintenanceDate;
    
    // ID của trạm
    private Long stationId; 
}