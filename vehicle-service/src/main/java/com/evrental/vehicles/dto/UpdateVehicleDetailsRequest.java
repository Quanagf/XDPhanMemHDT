package com.evrental.vehicles.dto;

import java.time.LocalDate;

import com.evrental.vehicles.model.Vehicle;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateVehicleDetailsRequest {
    @Pattern(regexp = "^[A-Z0-9\\-\\s]+$", message = "Biển số phải chứa chữ cái, chữ số, dấu gạch ngang và khoảng trắng")
    private String licensePlate;

    private String type;

    @Min(value = 0, message = "Giá phải >= 0")
    private Double pricePerHour;

    @Min(value = 0, message = "Pin phải >= 0")
    @Max(value = 100, message = "Pin phải <= 100")
    private Integer batteryLevel;

    private Vehicle.VehicleStatus status;
    
    private String description;
    private LocalDate lastMaintenanceDate;
    
    private Long stationId;
    
    // Thông số kỹ thuật bổ sung
    private Integer seats;
    private Double batteryCapacity;
    private Integer range;
    private String chargingType;
    private String chargingSpeed;
    private String location;
    private Integer tripCount;
    
    // Trạng thái bảo trì và kỹ thuật
    private String technicalCondition; // Tình trạng kỹ thuật (excellent, good, fair, poor)
    private String maintenanceNotes; // Ghi chú bảo trì
}