package com.evrental.payment.repository;

import com.evrental.payment.model.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {
    
    /**
     * Tìm tất cả payment records theo booking ID
     */
    List<PaymentRecord> findByBookingIdOrderByPaymentTimeDesc(Long bookingId);
    
    /**
     * Tìm payment records theo handover ID
     */
    List<PaymentRecord> findByHandoverId(Long handoverId);
    
    /**
     * Tính tổng số tiền đã thanh toán cho một booking
     */
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentRecord p " +
           "WHERE p.bookingId = :bookingId AND p.paymentStatus = 'COMPLETED'")
    BigDecimal getTotalPaidAmount(@Param("bookingId") Long bookingId);
    
    /**
     * Kiểm tra đã thanh toán cọc chưa
     */
    @Query("SELECT COUNT(p) > 0 FROM PaymentRecord p " +
           "WHERE p.bookingId = :bookingId AND p.paymentType = 'DEPOSIT' " +
           "AND p.paymentStatus = 'COMPLETED'")
    boolean hasDepositPaid(@Param("bookingId") Long bookingId);
}
