package com.evrental.booking.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "vehicle_handovers")
public class VehicleHandover {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Enumerated(EnumType.STRING)
    @Column(name = "handover_type", nullable = false)
    private HandoverType handoverType;

    @Column(name = "staff_id", nullable = false)
    private Long staffId;

    @Column(name = "customer_arrived")
    @Builder.Default
    private Boolean customerArrived = false;

    @Column(name = "customer_verified")
    @Builder.Default
    private Boolean customerVerified = false;

    @Column(name = "vehicle_images", columnDefinition = "TEXT")
    private String vehicleImages;  // JSON array URLs

    @Column(name = "vehicle_condition_notes", columnDefinition = "TEXT")
    private String vehicleConditionNotes;

    @Column(name = "deposit_amount", precision = 10, scale = 2)
    private BigDecimal depositAmount;  // Chỉ cho PICKUP

    @Column(name = "additional_charges", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal additionalCharges = BigDecimal.ZERO;  // Chỉ cho RETURN

    @Column(name = "additional_charges_reason", columnDefinition = "TEXT")
    private String additionalChargesReason;

    @Column(name = "final_payment_amount", precision = 10, scale = 2)
    private BigDecimal finalPaymentAmount;  // Chỉ cho RETURN

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "renter_signature", columnDefinition = "TEXT")
    private String renterSignature;

    @Column(name = "staff_signature", columnDefinition = "TEXT")
    private String staffSignature;

    @Column(name = "contract_url", columnDefinition = "TEXT")
    private String contractUrl;

    @Column(name = "handover_time")
    private LocalDateTime handoverTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (handoverTime == null) {
            handoverTime = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum HandoverType {
        PICKUP,   // Giao xe (nhận xe)
        RETURN    // Nhận xe trả
    }
}
