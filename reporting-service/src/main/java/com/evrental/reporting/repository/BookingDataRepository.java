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

    // --- Thống kê tỷ lệ sử dụng xe ---
    @Query(value = 
        "SELECT " +
        "    b.vehicle_id AS vehicleId, " +
        "    COALESCE(v.license_plate, CONCAT('Vehicle-', b.vehicle_id)) AS vehicleName, " +
        "    COUNT(b.id) AS totalTrips, " +
        "    SUM(TIMESTAMPDIFF(HOUR, b.actual_start_time, b.actual_end_time)) AS totalHours, " +
        "    ROUND(COUNT(b.id) * 100.0 / (SELECT COUNT(*) FROM booking_db.bookings WHERE status = 'COMPLETED'), 2) AS utilizationRate " +
        "FROM " +
        "    booking_db.bookings b " +
        "LEFT JOIN " +
        "    vehicle_db.vehicles v ON b.vehicle_id = v.id " +
        "WHERE " +
        "    b.status = 'COMPLETED' " +
        "GROUP BY " +
        "    b.vehicle_id, v.license_plate " +
        "ORDER BY " +
        "    totalTrips DESC",
        nativeQuery = true)
    List<Object[]> getVehicleUtilizationStats();

    // --- Phân tích giờ cao điểm/thấp điểm ---
    @Query(value = 
        "SELECT " +
        "    HOUR(b.actual_start_time) AS hour, " +
        "    COUNT(b.id) AS bookingCount " +
        "FROM " +
        "    booking_db.bookings b " +
        "WHERE " +
        "    b.status IN ('COMPLETED', 'ACTIVE') " +
        "    AND b.actual_start_time IS NOT NULL " +
        "GROUP BY " +
        "    HOUR(b.actual_start_time) " +
        "ORDER BY " +
        "    hour",
        nativeQuery = true)
    List<Object[]> getPeakHoursStats();

    // --- Doanh thu theo quý ---
    @Query(value = 
        "SELECT " +
        "    QUARTER(b.actual_end_time) AS quarter, " +
        "    SUM(b.total_cost) AS revenue " +
        "FROM " +
        "    booking_db.bookings b " +
        "WHERE " +
        "    b.status = 'COMPLETED' " +
        "    AND YEAR(b.actual_end_time) = :year " +
        "GROUP BY " +
        "    QUARTER(b.actual_end_time) " +
        "ORDER BY " +
        "    quarter",
        nativeQuery = true)
    List<Object[]> getRevenueByQuarter(@org.springframework.data.repository.query.Param("year") int year);

    // --- Doanh thu theo năm ---
    @Query(value = 
        "SELECT " +
        "    YEAR(b.actual_end_time) AS year, " +
        "    SUM(b.total_cost) AS revenue " +
        "FROM " +
        "    booking_db.bookings b " +
        "WHERE " +
        "    b.status = 'COMPLETED' " +
        "    AND YEAR(b.actual_end_time) BETWEEN :startYear AND :endYear " +
        "GROUP BY " +
        "    YEAR(b.actual_end_time) " +
        "ORDER BY " +
        "    year",
        nativeQuery = true)
    List<Object[]> getRevenueByYear(
        @org.springframework.data.repository.query.Param("startYear") int startYear,
        @org.springframework.data.repository.query.Param("endYear") int endYear);

    // --- Thống kê xe cụ thể ---
    @Query(value = 
        "SELECT " +
        "    b.vehicle_id AS vehicleId, " +
        "    COUNT(b.id) AS totalTrips, " +
        "    SUM(b.total_cost) AS totalRevenue, " +
        "    AVG(5.0) AS averageRating " + // Giả sử rating mặc định 5.0
        "FROM " +
        "    booking_db.bookings b " +
        "WHERE " +
        "    b.status = 'COMPLETED' " +
        "    AND b.vehicle_id = :vehicleId " +
        "GROUP BY " +
        "    b.vehicle_id",
        nativeQuery = true)
    Object[] getVehicleStatsById(@org.springframework.data.repository.query.Param("vehicleId") Long vehicleId);
}