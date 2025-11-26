package com.evrental.payment.controller;

import com.evrental.payment.dto.CreatePaymentRecordRequest;
import com.evrental.payment.model.PaymentRecord;
import com.evrental.payment.repository.PaymentRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/payment-records")
@RequiredArgsConstructor
@Slf4j
public class PaymentRecordController {

    private final PaymentRecordRepository paymentRecordRepository;

    /**
     * Tạo payment record mới (được gọi từ booking-service)
     */
    @PostMapping
    public ResponseEntity<PaymentRecord> createPaymentRecord(@RequestBody CreatePaymentRecordRequest request) {
        log.info("Creating payment record for booking: {}, type: {}", 
                request.getBookingId(), request.getPaymentType());
        
        PaymentRecord record = PaymentRecord.builder()
                .bookingId(request.getBookingId())
                .handoverId(request.getHandoverId())
                .paymentType(request.getPaymentType())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(request.getPaymentStatus() != null ? 
                    request.getPaymentStatus() : PaymentRecord.PaymentStatus.COMPLETED)
                .transactionRef(request.getTransactionRef())
                .notes(request.getNotes())
                .staffId(request.getStaffId())
                .paymentTime(LocalDateTime.now())
                .build();
        
        PaymentRecord saved = paymentRecordRepository.save(record);
        log.info("Payment record created with ID: {}", saved.getId());
        
        return ResponseEntity.ok(saved);
    }

    /**
     * Lấy tất cả payment records theo booking ID
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<PaymentRecord>> getPaymentRecordsByBooking(
            @PathVariable Long bookingId) {
        List<PaymentRecord> records = paymentRecordRepository.findByBookingIdOrderByPaymentTimeDesc(bookingId);
        return ResponseEntity.ok(records);
    }

    /**
     * Tính tổng tiền đã thanh toán cho booking
     */
    @GetMapping("/booking/{bookingId}/total")
    public ResponseEntity<BigDecimal> getTotalPaidAmount(@PathVariable Long bookingId) {
        BigDecimal total = paymentRecordRepository.getTotalPaidAmount(bookingId);
        return ResponseEntity.ok(total);
    }

    /**
     * Kiểm tra đã thanh toán cọc chưa
     */
    @GetMapping("/booking/{bookingId}/has-deposit")
    public ResponseEntity<Boolean> hasDepositPaid(@PathVariable Long bookingId) {
        boolean hasPaid = paymentRecordRepository.hasDepositPaid(bookingId);
        return ResponseEntity.ok(hasPaid);
    }
}
