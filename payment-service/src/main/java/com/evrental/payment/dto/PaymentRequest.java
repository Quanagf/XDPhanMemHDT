package com.evrental.payment.dto;

import com.evrental.payment.model.PaymentTransaction;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private Long userId;
    private Long bookingId; // Có thể null
    private BigDecimal amount;
    private PaymentTransaction.TransactionType type;
    private String paymentMethod;
}