package com.evrental.users.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "stations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Station {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, length = 500)
    private String address;
    
    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;
    
    @Column(nullable = false, length = 100)
    private String province; // Tỉnh/Thành phố
    
    @Column(length = 100)
    private String city; // Thành phố/Quận/Huyện
    
    @Column(precision = 10, scale = 8)
    private BigDecimal latitude; // Vĩ độ
    
    @Column(precision = 11, scale = 8)
    private BigDecimal longitude; // Kinh độ
    
    @Column(name = "opening_time")
    private LocalTime openingTime; // Giờ mở cửa
    
    @Column(name = "closing_time")
    private LocalTime closingTime; // Giờ đóng cửa
    
    @Column
    private Integer capacity = 0; // Sức chứa xe (số lượng xe tối đa)
    
    @Column(name = "is_active")
    private Boolean isActive = true; // Trạng thái hoạt động
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
