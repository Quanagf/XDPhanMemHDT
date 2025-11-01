package com.evrental.payment.model;

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
@Table(name = "payment_transactions")
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId; // User thực hiện giao dịch

    private Long bookingId; // Giao dịch này liên quan đến booking nào (có thể null nếu là nạp tiền)

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount; // Số tiền

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type; // Loại giao dịch

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status; // Trạng thái giao dịch

    private String paymentMethod; // "CREDIT_CARD", "MOMO", "CASH_AT_STATION" (2.c)
    private String transactionCode; // Mã giao dịch từ bên thứ 3 (nếu có)

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum TransactionType {
        BOOKING_PAYMENT, // Thanh toán phí thuê xe (1.d)
        DEPOSIT,         // Đặt cọc (2.c)
        REFUND,          // Hoàn cọc (2.c)
        TOP_UP           // Nạp tiền vào ví (nếu có)
    }

    public enum TransactionStatus {
        PENDING,   // Đang chờ xử lý
        SUCCESSFUL, // Thành công
        FAILED     // Thất bại
    }
}
