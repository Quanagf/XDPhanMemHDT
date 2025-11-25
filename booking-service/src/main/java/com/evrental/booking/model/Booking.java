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

    @Column(columnDefinition = "TEXT")
    private String vehicleConditionNotes; // Ghi chú tình trạng xe khi nhận lại

    @Column(columnDefinition = "TEXT")
    private String checkinVehicleImageUrl; // Ảnh xe lúc giao

    @Column(columnDefinition = "TEXT")
    private String customerLicenseImageUrl; // Ảnh bằng lái khách hàng

    @Builder.Default
    private Boolean staffVerifiedCustomer = false; // Nhân viên đã xác thực khách hàng

    // Thời gian deadline bàn giao xe (tự động tính từ estimatedStartTime)
    private LocalDateTime handoverDeadline;
    
    // Thời gian còn lại để bàn giao (tính bằng phút)
    private Integer handoverTimeoutMinutes;
    
    // Đánh dấu booking đã bị hủy do hết thời gian chờ
    @Builder.Default
    private Boolean timeoutCancelled = false;
    
    // Thời gian bắt đầu đếm ngược (khi booking được confirm)
    private LocalDateTime countdownStartTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalCost;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BookingType bookingType = BookingType.ADVANCE; // Mặc định là đặt trước

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    private BookingContract contract;

    public enum BookingStatus {
        PENDING,
        CONFIRMED,
        ACTIVE,
        COMPLETED,
        CANCELLED
    }

    public enum BookingType {
        ADVANCE, // Đặt trước
        ON_SPOT  // Đặt tại điểm
    }
}