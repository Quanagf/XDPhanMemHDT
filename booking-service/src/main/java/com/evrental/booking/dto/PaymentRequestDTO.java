package com.evrental.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

// DTO này dùng để GỬI request từ Booking -> Payment
@Data
@AllArgsConstructor
public class PaymentRequestDTO {
    private Long userId;
    private Long bookingId;
    private BigDecimal amount;
    private String type; // Gửi bằng String (BOOKING_PAYMENT)
    private String paymentMethod;
}