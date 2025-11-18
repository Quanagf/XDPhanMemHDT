package com.evrental.users.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "risk_point_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskPointHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String reason;
    
    @Column(name = "booking_id")
    private Long bookingId;
    
    @Column(columnDefinition = "TEXT")
    private String details;
    
    @Column(name = "added_by", nullable = false)
    private Long addedBy; // Staff/Admin who added the point
    
    @Column(name = "points_before", nullable = false)
    private Integer pointsBefore;
    
    @Column(name = "points_after", nullable = false)
    private Integer pointsAfter;
    
    @Column(name = "became_risky")
    private Boolean becameRisky;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
