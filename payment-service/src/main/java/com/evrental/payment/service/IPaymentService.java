package com.evrental.payment.service;

import com.evrental.payment.dto.PaymentRequest;
import com.evrental.payment.model.PaymentTransaction;

import java.util.List;

public interface IPaymentService {

    // Tạo và xử lý 1 giao dịch
    PaymentTransaction processPayment(PaymentRequest request);

    // Lấy lịch sử giao dịch của user
    List<PaymentTransaction> getUserTransactions(Long userId);
}