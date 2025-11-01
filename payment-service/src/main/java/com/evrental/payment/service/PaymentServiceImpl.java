package com.evrental.payment.service;

import com.evrental.payment.dto.PaymentRequest;
import com.evrental.payment.model.PaymentTransaction;
import com.evrental.payment.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID; // Để tạo mã giao dịch giả

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements IPaymentService {

    private final PaymentTransactionRepository paymentRepository;

    @Override
    public PaymentTransaction processPayment(PaymentRequest request) {
        
        // --- LOGIC XỬ LÝ THANH TOÁN GIẢ LẬP ---
        // Trong tương lai, đây là nơi bạn gọi:
        // MoMoResponse response = moMoApi.createPayment(...);
        // if (response.isSuccess()) { ... }
        // ----------------------------------------

        // Giả lập giao dịch luôn thành công
        PaymentTransaction.TransactionStatus status = PaymentTransaction.TransactionStatus.SUCCESSFUL;
        String transactionCode = "PM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        PaymentTransaction transaction = PaymentTransaction.builder()
                .userId(request.getUserId())
                .bookingId(request.getBookingId())
                .amount(request.getAmount())
                .type(request.getType())
                .status(status)
                .paymentMethod(request.getPaymentMethod())
                .transactionCode(transactionCode)
                .build();

        return paymentRepository.save(transaction);
        
        // TODO: Nếu là DEPOSIT hoặc TOP_UP, cần gọi lại user-service 
        // để cập nhật số dư (wallet) của user (nếu có)
    }

    @Override
    public List<PaymentTransaction> getUserTransactions(Long userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}