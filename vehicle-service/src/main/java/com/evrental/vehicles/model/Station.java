package com.evrental.vehicles.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
    
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;
    
    @Column(length = 100)
    private String province; // Tỉnh/Thành phố
    
    @Column(length = 100)
    private String city; // Thành phố/Quận/Huyện
    
    @Column(precision = 10, scale = 8)
    private BigDecimal latitude; // Vĩ độ
    
    @Column(precision = 11, scale = 8)
    private BigDecimal longitude; // Kinh độ
    
    @Column
    private Integer capacity = 0; // Sức chứa xe (số lượng xe tối đa)
    
    @Column(name = "operating_hours", length = 50)
    private String operatingHours; // Giờ hoạt động (ví dụ: "08:00 - 20:00")
    
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('OPEN', 'CLOSED', 'TEMPORARILY_UNAVAILABLE')")
    private StationStatus status; // Trạng thái trạm
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = StationStatus.OPEN;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Enum cho trạng thái
    public enum StationStatus {
        OPEN,                      // Đang hoạt động
        CLOSED,                    // Đóng cửa
        TEMPORARILY_UNAVAILABLE    // Tạm ngưng hoạt động
    }
}
