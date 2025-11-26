package com.evrental.booking.repository;

import com.evrental.booking.model.VehicleHandover;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleHandoverRepository extends JpaRepository<VehicleHandover, Long> {
    
    /**
     * Tìm tất cả handovers theo booking ID
     */
    List<VehicleHandover> findByBookingId(Long bookingId);
    
    /**
     * Tìm handover theo booking ID và loại
     */
    Optional<VehicleHandover> findByBookingIdAndHandoverType(Long bookingId, VehicleHandover.HandoverType type);
    
    /**
     * Tìm tất cả pickups chờ xử lý theo staff (customer chưa đến)
     */
    @Query("SELECT h FROM VehicleHandover h WHERE h.staffId = :staffId " +
           "AND h.handoverType = 'PICKUP' AND h.customerArrived = false " +
           "ORDER BY h.handoverTime DESC")
    List<VehicleHandover> findPendingPickupsByStaff(@Param("staffId") Long staffId);
    
    /**
     * Tìm tất cả returns cần xử lý
     */
    @Query("SELECT h FROM VehicleHandover h WHERE h.handoverType = 'RETURN' " +
           "AND h.customerVerified = false ORDER BY h.handoverTime DESC")
    List<VehicleHandover> findPendingReturns();
    
    /**
     * Lọc handovers theo ngày và tên khách hàng
     */
    @Query("SELECT h FROM VehicleHandover h JOIN Booking b ON h.bookingId = b.id " +
           "WHERE (:startDate IS NULL OR h.handoverTime >= :startDate) " +
           "AND (:endDate IS NULL OR h.handoverTime <= :endDate) " +
           "AND (:customerName IS NULL OR b.customerName LIKE %:customerName%) " +
           "ORDER BY h.handoverTime DESC")
    List<VehicleHandover> filterHandovers(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("customerName") String customerName
    );
}
