package com.evrental.vehicles.dto;

import com.evrental.vehicles.model.Vehicle;
import lombok.Data;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

@Data
public class UpdateVehicleDetailsRequest {
    @NotBlank(message = "Biển số không được trống")
    @Pattern(regexp = "^[A-Z0-9\\-]+$", message = "Biển số phải chứa chữ cái, chữ số và dấu gạch ngang")
    private String licensePlate;

    @NotBlank(message = "Loại xe không được trống")
    private String type;

    @NotNull(message = "Giá không được null")
    @Min(value = 0, message = "Giá phải >= 0")
    private Double pricePerHour;

    @Min(value = 0, message = "Pin phải >= 0")
    @Max(value = 100, message = "Pin phải <= 100")
    private Integer batteryLevel;

    private Vehicle.VehicleStatus status;
    
    private String description;
    private LocalDate lastMaintenanceDate;
    
    private Long stationId;
}