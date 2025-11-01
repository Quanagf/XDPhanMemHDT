package com.evrental.reporting.repository;

import com.evrental.reporting.dto.RevenueByStationDTO;
import com.evrental.reporting.model.BookingData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

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
        "    bookings b " +
        "JOIN " +
        "    stations s ON b.start_station_id = s.id " +
        "WHERE " +
        "    b.status = 'COMPLETED' " +
        "GROUP BY " +
        "    s.id, s.name " +
        "ORDER BY " +
        "    totalRevenue DESC",
        nativeQuery = true) // Dùng SQL thuần (Native Query)
    List<RevenueByStationDTO> getRevenueByStation();

    // --- Chức năng Lịch sử cá nhân (1.e) ---
    List<BookingData> findByUserIdOrderByActualStartTimeDesc(Long userId);
}