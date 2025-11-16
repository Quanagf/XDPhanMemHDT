package com.evrental.booking.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.evrental.booking.model.Booking;
import com.evrental.booking.model.Booking.BookingStatus;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Tìm lịch sử thuê của user (1.e)
    List<Booking> findByUserIdOrderByBookingTimeDesc(Long userId);

    // Tìm các xe đang được đặt (chưa lấy) hoặc đang thuê (2.a)
    List<Booking> findByVehicleIdAndStatusIn(Long vehicleId, List<BookingStatus> statuses);
    
    // Tìm các booking trùng với khoảng thời gian (để kiểm tra xe có sẵn)
    @Query("SELECT DISTINCT b.vehicleId FROM Booking b WHERE " +
           "(b.startTime < :endTime AND b.endTime > :startTime) AND " +
           "b.status IN ('PENDING', 'ACTIVE')")
    List<Long> findBookedVehicleIds(@Param("startTime") LocalDateTime startTime, 
                                     @Param("endTime") LocalDateTime endTime);
}