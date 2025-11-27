package com.evrental.reporting.service;

import com.evrental.reporting.dto.RevenueByStationDTO;
import com.evrental.reporting.model.BookingData;
import com.evrental.reporting.repository.BookingDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements IReportService {

    private final BookingDataRepository bookingDataRepository;
    // (Trong tương lai, bạn cũng inject các repository khác)

    @Override
    public List<RevenueByStationDTO> getRevenueReport() {
        return bookingDataRepository.getRevenueByStation();
    }

    @Override
    public List<BookingData> getUserHistory(Long userId) {
        // Service này cung cấp lại Lịch sử
        // (Tốt hơn là gọi API của booking-service, 
        // nhưng làm cách này cũng được)
        return bookingDataRepository.findByUserIdOrderByActualStartTimeDesc(userId);
    }

    @Override
    public List<java.util.Map<String, Object>> getVehicleUtilization() {
        List<Object[]> results = bookingDataRepository.getVehicleUtilizationStats();
        return results.stream()
            .map(row -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("vehicleId", row[0]);
                map.put("vehicleName", row[1]);
                map.put("totalTrips", row[2]);
                map.put("totalHours", row[3]);
                map.put("utilizationRate", row[4]);
                return map;
            })
            .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<java.util.Map<String, Object>> getPeakHoursAnalysis() {
        List<Object[]> results = bookingDataRepository.getPeakHoursStats();
        return results.stream()
            .map(row -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("hour", row[0]);
                map.put("bookingCount", row[1]);
                return map;
            })
            .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<java.util.Map<String, Object>> getRevenueByQuarter(int year) {
        List<Object[]> results = bookingDataRepository.getRevenueByQuarter(year);
        return results.stream()
            .map(row -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("quarter", "Q" + row[0]);
                map.put("revenue", row[1]);
                return map;
            })
            .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<java.util.Map<String, Object>> getRevenueByYear(int startYear, int endYear) {
        List<Object[]> results = bookingDataRepository.getRevenueByYear(startYear, endYear);
        return results.stream()
            .map(row -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("year", row[0]);
                map.put("revenue", row[1]);
                return map;
            })
            .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public java.util.Map<String, Object> getVehicleStats(Long vehicleId) {
        Object[] result = bookingDataRepository.getVehicleStatsById(vehicleId);
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        if (result != null) {
            map.put("vehicleId", result[0]);
            map.put("totalTrips", result[1]);
            map.put("totalRevenue", result[2]);
            map.put("averageRating", result[3]);
        }
        return map;
    }
}