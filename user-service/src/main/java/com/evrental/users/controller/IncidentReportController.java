package com.evrental.users.controller;

import com.evrental.users.dto.CreateIncidentReportRequest;
import com.evrental.users.dto.IncidentReportDTO;
import com.evrental.users.dto.UpdateIncidentReportRequest;
import com.evrental.users.service.IIncidentReportService;
import com.evrental.users.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incident-reports")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class IncidentReportController {
    
    private final IIncidentReportService incidentReportService;
    private final JwtService jwtService;
    
    /**
     * Tạo báo cáo sự cố mới (Staff)
     * POST /api/incident-reports
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<IncidentReportDTO> createReport(
            @Valid @RequestBody CreateIncidentReportRequest request,
            HttpServletRequest httpRequest) {
        
        String token = extractToken(httpRequest);
        Long reporterId = jwtService.extractUserId(token);
        String reporterName = jwtService.extractFullName(token);
        String reporterEmail = jwtService.extractEmail(token);
        
        IncidentReportDTO created = incidentReportService.createReport(
            request, reporterId, reporterName, reporterEmail
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    /**
     * Lấy tất cả báo cáo (Admin) - có phân trang và filter
     * GET /api/incident-reports
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<IncidentReportDTO>> getAllReports(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long reporterId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        Sort sort = sortDirection.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<IncidentReportDTO> reports = incidentReportService.searchReports(
            status, priority, category, reporterId, keyword, pageable
        );
        
        return ResponseEntity.ok(reports);
    }
    
    /**
     * Lấy báo cáo của nhân viên đang đăng nhập
     * GET /api/incident-reports/my-reports
     */
    @GetMapping("/my-reports")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<Page<IncidentReportDTO>> getMyReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            HttpServletRequest httpRequest) {
        
        String token = extractToken(httpRequest);
        Long reporterId = jwtService.extractUserId(token);
        
        Sort sort = sortDirection.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<IncidentReportDTO> reports = incidentReportService.getReportsByReporter(reporterId, pageable);
        
        return ResponseEntity.ok(reports);
    }
    
    /**
     * Lấy một báo cáo theo ID
     * GET /api/incident-reports/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<IncidentReportDTO> getReportById(@PathVariable Long id) {
        IncidentReportDTO report = incidentReportService.getReportById(id);
        return ResponseEntity.ok(report);
    }
    
    /**
     * Cập nhật báo cáo (Admin)
     * PUT /api/incident-reports/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<IncidentReportDTO> updateReport(
            @PathVariable Long id,
            @RequestBody UpdateIncidentReportRequest request) {
        
        IncidentReportDTO updated = incidentReportService.updateReport(id, request);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Gán báo cáo cho admin
     * PUT /api/incident-reports/{id}/assign
     */
    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<IncidentReportDTO> assignReport(
            @PathVariable Long id,
            @RequestBody Map<String, Long> request) {
        
        Long adminId = request.get("adminId");
        IncidentReportDTO updated = incidentReportService.assignReport(id, adminId);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Giải quyết báo cáo
     * PUT /api/incident-reports/{id}/resolve
     */
    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<IncidentReportDTO> resolveReport(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        String resolutionNote = request.get("resolutionNote");
        IncidentReportDTO updated = incidentReportService.resolveReport(id, resolutionNote);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Đóng báo cáo
     * PUT /api/incident-reports/{id}/close
     */
    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<IncidentReportDTO> closeReport(@PathVariable Long id) {
        IncidentReportDTO updated = incidentReportService.closeReport(id);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Xóa báo cáo
     * DELETE /api/incident-reports/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteReport(@PathVariable Long id) {
        incidentReportService.deleteReport(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã xóa báo cáo sự cố thành công");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Lấy thống kê báo cáo
     * GET /api/incident-reports/statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = incidentReportService.getReportStatistics();
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Lấy báo cáo theo khoảng thời gian
     * GET /api/incident-reports/by-date-range
     */
    @GetMapping("/by-date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<IncidentReportDTO>> getReportsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        
        List<IncidentReportDTO> reports = incidentReportService.getReportsByDateRange(start, end);
        return ResponseEntity.ok(reports);
    }
    
    // Helper method to extract token
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("Token not found");
    }
}
