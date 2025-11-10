package com.evrental.vehicles.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.ToString;

@Data
@Entity
@Table(name = "stations")
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;
    
    @Column(length = 500)
    private String address;
    
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;
    
    @Column(length = 100)
    private String province; // Tỉnh/Thành phố
    
    @Column(length = 100)
    private String city; // Quận/Huyện
    
    private Integer capacity; // Sức chứa xe (số lượng xe tối đa)

    @Enumerated(EnumType.STRING)
    private StationStatus status; // Trạng thái trạm
    
    public enum StationStatus {
        OPEN,       // Đang hoạt động
        CLOSED,     // Đóng cửa
        TEMPORARILY_UNAVAILABLE // Tạm ngừng
    }

    // Quan hệ 1-Nhiều: Một trạm có nhiều xe
    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    @ToString.Exclude
    private List<Vehicle> vehicles;
}