package com.evrental.booking.repository;

import com.evrental.booking.model.WalkInCustomer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalkInCustomerRepository extends JpaRepository<WalkInCustomer, Long> {
    
    /**
     * Tìm khách hàng walk-in theo số điện thoại
     */
    Optional<WalkInCustomer> findByPhoneNumber(String phoneNumber);
    
    /**
     * Kiểm tra khách hàng có tồn tại với số điện thoại này không
     */
    boolean existsByPhoneNumber(String phoneNumber);
}
