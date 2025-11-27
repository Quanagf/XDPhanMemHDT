package com.evrental.reporting.controller;

import com.evrental.reporting.dto.RevenueByStationDTO;
import com.evrental.reporting.model.BookingData;
import com.evrental.reporting.service.IReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final IReportService reportService;

    @GetMapping("/ping")
    public String ping() {
        return "Reporting-Service is alive!";
    }

    // API Báo cáo Doanh thu (3.d)
    @GetMapping("/revenue-by-station")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RevenueByStationDTO>> getRevenueReport() {
        return ResponseEntity.ok(reportService.getRevenueReport());
    }

    // API Lịch sử cá nhân (1.e)
    @GetMapping("/history/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingData>> getUserHistory(
            @PathVariable Long userId) {
        
        return ResponseEntity.ok(reportService.getUserHistory(userId));
    }

    // API Thống kê tỷ lệ sử dụng xe
    @GetMapping("/vehicle-utilization")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getVehicleUtilization() {
        return ResponseEntity.ok(reportService.getVehicleUtilization());
    }

    // API Phân tích giờ cao điểm/thấp điểm
    @GetMapping("/peak-hours")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPeakHoursAnalysis() {
        return ResponseEntity.ok(reportService.getPeakHoursAnalysis());
    }

    // API Doanh thu theo quý
    @GetMapping("/revenue-by-quarter")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getRevenueByQuarter(@RequestParam int year) {
        return ResponseEntity.ok(reportService.getRevenueByQuarter(year));
    }

    // API Doanh thu theo năm
    @GetMapping("/revenue-by-year")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getRevenueByYear(
            @RequestParam int startYear,
            @RequestParam int endYear) {
        return ResponseEntity.ok(reportService.getRevenueByYear(startYear, endYear));
    }

    // API Thống kê xe cụ thể
    @GetMapping("/vehicle/{vehicleId}/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getVehicleStats(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(reportService.getVehicleStats(vehicleId));
    }
}