package com.evrental.users.service;

import com.evrental.users.dto.CreateIncidentReportRequest;
import com.evrental.users.dto.IncidentReportDTO;
import com.evrental.users.dto.UpdateIncidentReportRequest;
import com.evrental.users.model.IncidentReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface IIncidentReportService {
    
    // Tạo báo cáo sự cố mới (Staff)
    IncidentReportDTO createReport(CreateIncidentReportRequest request, Long reporterId, String reporterName, String reporterEmail);
    
    // Lấy tất cả báo cáo (Admin)
    Page<IncidentReportDTO> getAllReports(Pageable pageable);
    
    // Lấy báo cáo của một nhân viên cụ thể
    Page<IncidentReportDTO> getReportsByReporter(Long reporterId, Pageable pageable);
    
    // Lấy báo cáo theo ID
    IncidentReportDTO getReportById(Long id);
    
    // Cập nhật báo cáo (Admin)
    IncidentReportDTO updateReport(Long id, UpdateIncidentReportRequest request);
    
    // Gán báo cáo cho admin
    IncidentReportDTO assignReport(Long id, Long adminId);
    
    // Giải quyết báo cáo
    IncidentReportDTO resolveReport(Long id, String resolutionNote);
    
    // Đóng báo cáo
    IncidentReportDTO closeReport(Long id);
    
    // Xóa báo cáo
    void deleteReport(Long id);
    
    // Tìm kiếm báo cáo với filters
    Page<IncidentReportDTO> searchReports(
        String status,
        String priority,
        String category,
        Long reporterId,
        String keyword,
        Pageable pageable
    );
    
    // Thống kê báo cáo
    Map<String, Object> getReportStatistics();
    
    // Lấy báo cáo trong khoảng thời gian
    List<IncidentReportDTO> getReportsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
}
