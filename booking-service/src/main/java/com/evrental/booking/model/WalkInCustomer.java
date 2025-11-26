package com.evrental.booking.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "walk_in_customers")
public class WalkInCustomer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "phone_number", nullable = false, unique = true, length = 20)
    private String phoneNumber;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "gplx_image_url", columnDefinition = "TEXT")
    private String gplxImageUrl;

    @Column(name = "cccd_image_url", columnDefinition = "TEXT")
    private String cccdImageUrl;

    @Column(name = "gplx_number", length = 50)
    private String gplxNumber;

    @Column(name = "cccd_number", length = 50)
    private String cccdNumber;

    @Column(name = "station_id", nullable = false)
    private Long stationId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "total_bookings")
    private Integer totalBookings = 0;

    @Column(name = "last_booking_date")
    private LocalDateTime lastBookingDate;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
