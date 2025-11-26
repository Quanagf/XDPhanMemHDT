package com.evrental.booking.service;

import com.evrental.booking.model.WalkInCustomer;
import com.evrental.booking.repository.WalkInCustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalkInCustomerService {

    private final WalkInCustomerRepository walkInCustomerRepository;

    /**
     * Tìm hoặc tạo mới khách hàng walk-in
     * Nếu số điện thoại đã tồn tại, cập nhật thông tin
     * Nếu chưa tồn tại, tạo mới
     */
    @Transactional
    public WalkInCustomer findOrCreateCustomer(
            String fullName,
            String phoneNumber,
            String email,
            String gplxImageUrl,
            String cccdImageUrl,
            Long stationId
    ) {
        Optional<WalkInCustomer> existingCustomer = walkInCustomerRepository.findByPhoneNumber(phoneNumber);

        if (existingCustomer.isPresent()) {
            // Cập nhật thông tin khách hàng hiện tại
            WalkInCustomer customer = existingCustomer.get();
            customer.setFullName(fullName);
            customer.setEmail(email);
            
            // Cập nhật GPLX/CCCD nếu có
            if (gplxImageUrl != null && !gplxImageUrl.isEmpty()) {
                customer.setGplxImageUrl(gplxImageUrl);
            }
            if (cccdImageUrl != null && !cccdImageUrl.isEmpty()) {
                customer.setCccdImageUrl(cccdImageUrl);
            }

            log.info("Cập nhật thông tin khách hàng walk-in: {}", phoneNumber);
            return walkInCustomerRepository.save(customer);
        } else {
            // Tạo mới khách hàng
            WalkInCustomer newCustomer = new WalkInCustomer();
            newCustomer.setFullName(fullName);
            newCustomer.setPhoneNumber(phoneNumber);
            newCustomer.setEmail(email);
            newCustomer.setGplxImageUrl(gplxImageUrl);
            newCustomer.setCccdImageUrl(cccdImageUrl);
            newCustomer.setStationId(stationId);
            newCustomer.setTotalBookings(0);

            log.info("Tạo mới khách hàng walk-in: {}", phoneNumber);
            return walkInCustomerRepository.save(newCustomer);
        }
    }

    /**
     * Cập nhật số lần đặt xe và ngày đặt cuối cùng
     */
    @Transactional
    public void updateBookingStats(Long customerId) {
        walkInCustomerRepository.findById(customerId).ifPresent(customer -> {
            customer.setTotalBookings(customer.getTotalBookings() + 1);
            customer.setLastBookingDate(LocalDateTime.now());
            walkInCustomerRepository.save(customer);
            log.info("Cập nhật thống kê booking cho khách hàng ID: {}", customerId);
        });
    }

    /**
     * Tìm khách hàng theo số điện thoại
     */
    public Optional<WalkInCustomer> findByPhoneNumber(String phoneNumber) {
        return walkInCustomerRepository.findByPhoneNumber(phoneNumber);
    }
}
