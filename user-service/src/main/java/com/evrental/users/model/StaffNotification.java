package com.evrental.users.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "staff_notifications")
public class StaffNotification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "booking_id")
    private Long bookingId;
    
    @Column(name = "station_id")
    private Long stationId;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "vehicle_id")
    private Long vehicleId;
    
    @Column(name = "customer_name")
    private String customerName;
    
    @Column(name = "customer_phone")
    private String customerPhone;
    
    @Column(name = "customer_email")
    private String customerEmail;
    
    @Column(name = "vehicle_model")
    private String vehicleModel;
    
    @Column(name = "vehicle_plate")
    private String vehiclePlate;
    
    @Column(name = "estimated_start_time")
    private LocalDateTime estimatedStartTime;
    
    @Column(name = "estimated_end_time")
    private LocalDateTime estimatedEndTime;
    
    @Column(name = "booking_time")
    private LocalDateTime bookingTime;
    
    @Column(name = "notification_type")
    private String notificationType;
    
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "station_name")
    private String stationName;
    
    @Column(name = "station_address")
    private String stationAddress;
    
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
}