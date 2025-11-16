package com.evrental.vehicles.dto;

import java.time.LocalDate;

import com.evrental.vehicles.model.Vehicle;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreateVehicleRequest {
    @NotBlank(message = "Biển số không được trống")
    @Pattern(regexp = "^[A-Z0-9\\-\\s]+$", message = "Biển số phải chứa chữ cái, chữ số, dấu gạch ngang và khoảng trắng")
    private String licensePlate;

    @NotBlank(message = "Loại xe không được trống")
    private String type;

    @NotNull(message = "Pin không được null")
    @Min(value = 0, message = "Pin phải >= 0")
    @Max(value = 100, message = "Pin phải <= 100")
    private Integer batteryLevel;

    @NotNull(message = "Giá không được null")
    @Min(value = 0, message = "Giá phải >= 0")
    private Double pricePerHour;

    @NotNull(message = "Trạng thái không được null")
    private Vehicle.VehicleStatus status;
    
    private String imageUrl;
    private String description;
    private LocalDate lastMaintenanceDate;
    
    @NotNull(message = "ID trạm không được null")
    private Long stationId;
    
    // Thông số kỹ thuật bổ sung
    private Integer seats; // Số ghế
    private Double batteryCapacity; // Dung lượng pin (kWh)
    private Integer range; // Phạm vi di chuyển (km)
    private String chargingType; // Loại cổng sạc
    private String chargingSpeed; // Tốc độ sạc
    private String location; // Vị trí hiện tại
    private Integer tripCount; // Số chuyến đã thực hiện
}