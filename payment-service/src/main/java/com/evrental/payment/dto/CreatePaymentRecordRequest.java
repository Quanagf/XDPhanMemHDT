package com.evrental.payment.dto;

import com.evrental.payment.model.PaymentRecord;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreatePaymentRecordRequest {
    private Long bookingId;
    private Long handoverId;
    private PaymentRecord.PaymentType paymentType;
    private BigDecimal amount;
    private String paymentMethod;
    private PaymentRecord.PaymentStatus paymentStatus;
    private String transactionRef;
    private String notes;
    private Long staffId;
}
