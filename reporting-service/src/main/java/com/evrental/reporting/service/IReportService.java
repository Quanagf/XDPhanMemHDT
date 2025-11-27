package com.evrental.reporting.service;

import com.evrental.reporting.dto.RevenueByStationDTO;
import com.evrental.reporting.model.BookingData;

import java.util.List;
import java.util.Map;

public interface IReportService {

    // (3.d) Báo cáo cho Admin
    List<RevenueByStationDTO> getRevenueReport();

    // (1.e) Lịch sử/Phân tích cho Renter
    List<BookingData> getUserHistory(Long userId);

    // Thống kê tỷ lệ sử dụng xe
    List<Map<String, Object>> getVehicleUtilization();

    // Phân tích giờ cao điểm/thấp điểm
    List<Map<String, Object>> getPeakHoursAnalysis();

    // Doanh thu theo quý
    List<Map<String, Object>> getRevenueByQuarter(int year);

    // Doanh thu theo năm
    List<Map<String, Object>> getRevenueByYear(int startYear, int endYear);

    // Thống kê xe cụ thể
    Map<String, Object> getVehicleStats(Long vehicleId);
}