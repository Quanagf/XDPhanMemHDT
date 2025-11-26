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

    @Column(name = "user_id")
    private Long userId;  // Nullable cho walk-in booking

    @Column(name = "vehicle_id", nullable = false)
    private Long vehicleId;

    @Column(name = "start_station_id", nullable = false)
    private Long startStationId;

    @Column(name = "end_station_id")
    private Long endStationId;

    @Column(name = "booking_time")
    private LocalDateTime bookingTime;
    
    @Column(name = "estimated_start_time")
    private LocalDateTime estimatedStartTime;
    
    @Column(name = "estimated_end_time")
    private LocalDateTime estimatedEndTime;

    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;
    
    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;

    @Column(name = "checkout_vehicle_image_url", columnDefinition = "TEXT")
    private String checkoutVehicleImageUrl; // Ảnh xe lúc trả

    @Column(columnDefinition = "TEXT")
    private String vehicleConditionNotes; // Ghi chú tình trạng xe khi nhận lại

    @Column(name = "checkin_vehicle_image_url", columnDefinition = "TEXT")
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
    
    // === Liên kết với khách hàng walk-in ===
    @Column(name = "walk_in_customer_id")
    private Long walkInCustomerId;  // Foreign key đến bảng walk_in_customers
    
    // === Thông tin khách hàng walk-in (cho booking không có userId) ===
    @Column(length = 100)
    private String customerName;    // Họ tên khách hàng
    
    @Column(length = 20)
    private String customerPhone;   // Số điện thoại
    
    @Column(length = 100)
    private String customerEmail;   // Email (tùy chọn)
    
    @Column(columnDefinition = "TEXT")
    private String gplxImageUrl;    // URL ảnh GPLX
    
    @Column(columnDefinition = "TEXT")
    private String cccdImageUrl;    // URL ảnh CCCD
    
    // === Quản lý nhận/trả xe ===
    @Column(name = "deposit_amount", precision = 10, scale = 2)
    private BigDecimal depositAmount;  // Tiền đặt cọc khi nhận xe
    
    @Column(name = "pickup_vehicle_images", columnDefinition = "TEXT")
    private String pickupVehicleImages;  // JSON array URLs ảnh xe khi giao
    
    @Column(name = "return_vehicle_images", columnDefinition = "TEXT")
    private String returnVehicleImages;  // JSON array URLs ảnh xe khi trả
    
    @Column(name = "additional_charges", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal additionalCharges = BigDecimal.ZERO;  // Phí phát sinh
    
    @Column(name = "additional_charges_reason", columnDefinition = "TEXT")
    private String additionalChargesReason;  // Lý do phí phát sinh
    
    @Column(name = "final_payment_amount", precision = 10, scale = 2)
    private BigDecimal finalPaymentAmount;  // Số tiền thanh toán cuối cùng
    
    @Column(name = "staff_pickup_id")
    private Long staffPickupId;  // ID nhân viên giao xe
    
    @Column(name = "staff_return_id")
    private Long staffReturnId;  // ID nhân viên nhận xe trả

    // === Hủy booking ===
    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;  // Lý do hủy
    
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;  // Thời gian hủy

    public enum BookingStatus {
        PENDING,
        CONFIRMED,
        ACTIVE,
        COMPLETED,
        CANCELLED
    }

    public enum BookingType {
        ADVANCE,  // Đặt trước
        ON_SPOT,  // Đặt tại điểm (legacy)
        WALK_IN   // Khách vãng lai đến trạm
    }
}