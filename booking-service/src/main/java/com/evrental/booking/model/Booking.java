package com.evrental.booking.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long vehicleId;

    @Column(nullable = false)
    private Long startStationId;

    private Long endStationId;

    private LocalDateTime bookingTime;
    private LocalDateTime estimatedStartTime;
    private LocalDateTime estimatedEndTime;

    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;

    @Column(columnDefinition = "TEXT")
    private String checkoutVehicleImageUrl; // <-- THÊM DÒNG NÀY (Ảnh xe lúc trả)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalCost;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    private BookingContract contract;

    public enum BookingStatus {
        PENDING,
        CONFIRMED,
        ACTIVE,
        COMPLETED,
        CANCELLED
    }
}