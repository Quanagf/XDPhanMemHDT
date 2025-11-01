package com.evrental.booking.repository;

import com.evrental.booking.model.Booking;
import com.evrental.booking.model.Booking.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Tìm lịch sử thuê của user (1.e)
    List<Booking> findByUserIdOrderByBookingTimeDesc(Long userId);

    // Tìm các xe đang được đặt (chưa lấy) hoặc đang thuê (2.a)
    List<Booking> findByVehicleIdAndStatusIn(Long vehicleId, List<BookingStatus> statuses);
}