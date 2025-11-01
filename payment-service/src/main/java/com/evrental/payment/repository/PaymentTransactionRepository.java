package com.evrental.payment.repository;

import com.evrental.payment.model.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    // Tìm lịch sử giao dịch của user
    List<PaymentTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Tìm giao dịch theo booking
    List<PaymentTransaction> findByBookingId(Long bookingId);
}