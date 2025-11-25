package com.evrental.payment.controller;

import com.evrental.payment.dto.PaymentRequest;
import com.evrental.payment.model.PaymentTransaction;
import com.evrental.payment.service.IPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final IPaymentService paymentService;

    @GetMapping("/ping")
    @PreAuthorize("permitAll()")
    public String ping() {
        return "Payment-Service is alive!";
    }

    // API cho Staff (2.c) hoặc service (1.d) gọi
    @PostMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<PaymentTransaction> createPayment(
            @RequestBody PaymentRequest request) {
        
        PaymentTransaction transaction = paymentService.processPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    // API cho Renter tạo payment (đặt cọc) - THÊM MỚI
    @PostMapping("/create")
    @PreAuthorize("hasRole('RENTER')")
    public ResponseEntity<?> createUserPayment(@RequestBody PaymentRequest request) {
        try {
            PaymentTransaction transaction = paymentService.processPayment(request);
            
            // Trả về response đơn giản cho frontend
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", true);
            response.put("transactionId", transaction.getId());
            response.put("amount", transaction.getAmount());
            response.put("paymentMethod", transaction.getPaymentMethod());
            response.put("status", transaction.getStatus());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            java.util.Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // API cho Renter/Admin xem lịch sử giao dịch
    @GetMapping("/history/user/{userId}")
    @PreAuthorize("hasRole('RENTER') or hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<List<PaymentTransaction>> getUserHistory(
            @PathVariable Long userId) {
        
        // (Cần kiểm tra user có đúng là chủ sở hữu hoặc admin không)
        List<PaymentTransaction> transactions = paymentService.getUserTransactions(userId);
        return ResponseEntity.ok(transactions);
    }
}