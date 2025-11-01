package com.evrental.vehicles.dto;

import com.evrental.vehicles.model.Vehicle;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateVehicleDetailsRequest {
    // Thuộc tính cũ
    private Integer batteryLevel;
    private Vehicle.VehicleStatus status;
    
    // Thuộc tính mới (cho Staff cập nhật - 2.d)
    private String description;
    private LocalDate lastMaintenanceDate;
}