package com.evrental.users.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "incident_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentReport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "reporter_id", nullable = false)
    private Long reporterId;
    
    @Column(name = "reporter_name", nullable = false)
    private String reporterName;
    
    @Column(name = "reporter_email", nullable = false)
    private String reporterEmail;
    
    @Column(nullable = false, length = 500)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, length = 50)
    private String category; // VEHICLE_ISSUE, CUSTOMER_COMPLAINT, SYSTEM_ERROR, SAFETY_CONCERN, OTHER
    
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;
    
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;
    
    @Column(length = 500)
    private String location;
    
    @Column(name = "vehicle_id")
    private Long vehicleId;
    
    @Column(name = "vehicle_plate", length = 50)
    private String vehiclePlate;
    
    @Column(name = "station_id")
    private Long stationId;
    
    @Column(name = "station_name")
    private String stationName;
    
    @Column(name = "assigned_to")
    private Long assignedTo; // Admin ID
    
    @Column(name = "resolution_note", columnDefinition = "TEXT")
    private String resolutionNote;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL
    }
    
    public enum Status {
        PENDING,      // Chờ xử lý
        IN_PROGRESS,  // Đang xử lý
        RESOLVED,     // Đã giải quyết
        CLOSED,       // Đã đóng
        REJECTED      // Từ chối
    }
}
