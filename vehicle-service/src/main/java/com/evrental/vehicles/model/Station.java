package com.evrental.vehicles.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.List;

@Data
@Entity
@Table(name = "stations")
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;

    // --- Thuộc tính mới ---
    @Column(length = 50)
    private String operatingHours; // Ví dụ: "08:00 - 22:00"

    private Integer capacity; // Sức chứa tối đa

    @Enumerated(EnumType.STRING)
    private StationStatus status; // Trạng thái trạm
    
    public enum StationStatus {
        OPEN,
        CLOSED,
        TEMPORARILY_UNAVAILABLE
    }
    // --------------------

    // Quan hệ 1-Nhiều: Một trạm có nhiều xe
    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    @ToString.Exclude
    private List<Vehicle> vehicles;
}