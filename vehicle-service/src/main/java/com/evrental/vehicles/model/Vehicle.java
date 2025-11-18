package com.evrental.vehicles.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.ToString;

@Data
@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    @NotBlank(message = "Biển số không được trống")
    @Pattern(regexp = "^[A-Z0-9\\-\\.\\s]+$", message = "Biển số phải chứa chữ cái, chữ số, dấu gạch ngang, dấu chấm và khoảng trắng")
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

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Trạng thái không được null")
    private VehicleStatus status;
    
    public enum VehicleStatus {
        AVAILABLE,
        RESERVED,
        RENTED,
        MAINTENANCE
    }

    // URL ảnh xe
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;
    
    private LocalDate lastMaintenanceDate;

    // Thông số kỹ thuật bổ sung
    private Integer seats; // Số ghế
    private Double batteryCapacity; // Dung lượng pin (kWh)
    
    @Column(name = "`range`") // Escape reserved keyword
    private Integer range; // Phạm vi di chuyển (km)
    
    private String chargingType; // Loại cổng sạc (CCS2, CHAdeMO, Type 2, etc.)
    private String chargingSpeed; // Tốc độ sạc (ví dụ: "10-70% trong ~25 mins")
    private String location; // Vị trí hiện tại
    private Integer tripCount; // Số chuyến đã thực hiện
    
    // Trạng thái bảo trì và kỹ thuật
    private String technicalCondition; // Tình trạng kỹ thuật (excellent, good, fair, poor)
    
    @Column(columnDefinition = "TEXT")
    private String maintenanceNotes; // Ghi chú bảo trì

    // Quan hệ Nhiều-1: Nhiều xe thuộc 1 trạm
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    @JsonBackReference
    @ToString.Exclude
    private Station station;
}