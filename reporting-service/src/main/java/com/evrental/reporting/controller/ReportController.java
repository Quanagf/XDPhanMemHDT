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
    @PreAuthorize("isAuthenticated()")
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
}