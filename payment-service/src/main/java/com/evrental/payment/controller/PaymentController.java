package com.evrental.payment.controller;

import com.evrental.payment.dto.PaymentRequest;
import com.evrental.payment.model.PaymentTransaction;
import com.evrental.payment.service.IPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final IPaymentService paymentService;

    @GetMapping("/ping")
    public String ping() {
        return "Payment-Service is alive!";
    }

    // API cho Staff (2.c) hoặc service (1.d) gọi
    @PostMapping
    // TODO: @PreAuthorize("hasRole('STAFF') or ... (cho phép service nội bộ)")
    public ResponseEntity<PaymentTransaction> createPayment(
            @RequestBody PaymentRequest request) {
        
        PaymentTransaction transaction = paymentService.processPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    // API cho Renter/Admin xem lịch sử giao dịch
    @GetMapping("/history/user/{userId}")
    // TODO: @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PaymentTransaction>> getUserHistory(
            @PathVariable Long userId) {
        
        // (Cần kiểm tra user có đúng là chủ sở hữu hoặc admin không)
        List<PaymentTransaction> transactions = paymentService.getUserTransactions(userId);
        return ResponseEntity.ok(transactions);
    }
}