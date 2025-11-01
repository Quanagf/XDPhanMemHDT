package com.evrental.reporting.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable; // Quan trọng

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Immutable // Báo cho Hibernate: Đừng bao giờ update bảng này
@Table(name = "bookings") // Map vào bảng "bookings" có sẵn
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