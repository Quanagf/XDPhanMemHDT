package com.evrental.reporting.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.evrental.reporting.dto.RevenueByStationDTO;
import com.evrental.reporting.model.BookingData;

@Repository
public interface BookingDataRepository extends JpaRepository<BookingData, Long> {

    // --- Chức năng Báo cáo Doanh thu (3.d) ---
        @Query(value = 
        "SELECT " +
        "    s.id AS stationId, " +
        "    s.name AS stationName, " +
        "    COUNT(b.id) AS totalBookings, " +
        "    SUM(b.total_cost) AS totalRevenue " +
        "FROM " +
        "    booking_db.bookings b " + // <-- THAY ĐỔI
        "JOIN " +
        "    vehicle_db.stations s ON b.start_station_id = s.id " +
        "WHERE " +
        "    b.status = 'COMPLETED' " +
        "GROUP BY " +
        "    s.id, s.name " +
        "ORDER BY " +
        "    totalRevenue DESC",
        nativeQuery = true)
    List<RevenueByStationDTO> getRevenueByStation();

    // --- Chức năng Lịch sử cá nhân (1.e) ---
    List<BookingData> findByUserIdOrderByActualStartTimeDesc(Long userId);
}