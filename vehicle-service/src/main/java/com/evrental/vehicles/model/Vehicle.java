package com.evrental.vehicles.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDate; // Thêm import này

@Data
@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String licensePlate;
    private String type;
    private Integer batteryLevel;
    private Double pricePerHour;

    @Enumerated(EnumType.STRING)
    private VehicleStatus status;
    
    public enum VehicleStatus {
        AVAILABLE,
        RENTED,
        MAINTENANCE
    }

    // --- Thuộc tính mới ---
    private String imageUrl; // Link ảnh xe

    @Column(columnDefinition = "TEXT")
    private String description; // Mô tả tình trạng kỹ thuật
    
    private LocalDate lastMaintenanceDate; // Ngày bảo trì cuối
    // --------------------

    // Quan hệ Nhiều-1: Nhiều xe thuộc 1 trạm
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    @JsonBackReference
    @ToString.Exclude
    private Station station;
}