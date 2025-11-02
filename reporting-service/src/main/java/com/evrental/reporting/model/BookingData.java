package com.evrental.reporting.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.Immutable; // Quan trọng

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Immutable // Báo cho Hibernate: Đừng bao giờ update bảng này
@Table(name = "bookings", schema = "booking_db")
public class BookingData {

    @Id
    private Long id; // Phải có @Id

    private Long userId;
    private Long vehicleId;
    private Long startStationId;

    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    private BigDecimal totalCost;

    public enum BookingStatus {
        PENDING, CONFIRMED, ACTIVE, COMPLETED, CANCELLED
    }
}