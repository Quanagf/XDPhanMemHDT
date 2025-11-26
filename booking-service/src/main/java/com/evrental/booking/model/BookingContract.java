package com.evrental.booking.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor; // Thêm AllArgsConstructor nếu chưa có
import lombok.Builder; // Thêm Builder nếu chưa có

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor // Thêm nếu cần cho Builder
@Builder // Thêm nếu cần cho Builder
@Entity
@Table(name = "booking_contracts")
public class BookingContract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore
    private Booking booking;

    @Column(columnDefinition = "TEXT")
    private String termsAndConditions;

    @Column(columnDefinition = "TEXT")
    private String renterSignature;  // URL file chữ ký điện tử khách thuê
    
    @Column(columnDefinition = "TEXT")
    private String staffSignature;  // URL file chữ ký điện tử nhân viên

    @Column(columnDefinition = "TEXT")
    private String checkinVehicleImageUrl; // <-- THÊM DÒNG NÀY (Ảnh xe lúc giao)

    private LocalDateTime signedAt;

    // Giữ constructor cũ hoặc dùng @Builder thay thế
    public BookingContract(Booking booking, String terms) {
        this.booking = booking;
        this.termsAndConditions = terms;
        this.signedAt = LocalDateTime.now();
    }
}