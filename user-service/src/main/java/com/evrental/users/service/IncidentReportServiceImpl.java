package com.evrental.users.service;

import com.evrental.users.dto.CreateIncidentReportRequest;
import com.evrental.users.dto.IncidentReportDTO;
import com.evrental.users.dto.UpdateIncidentReportRequest;
import com.evrental.users.model.IncidentReport;
import com.evrental.users.model.User;
import com.evrental.users.repository.IncidentReportRepository;
import com.evrental.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class IncidentReportServiceImpl implements IIncidentReportService {
    
    private final IncidentReportRepository incidentReportRepository;
    private final UserRepository userRepository;
    
    @Override
    public IncidentReportDTO createReport(CreateIncidentReportRequest request, Long reporterId, 
                                         String reporterName, String reporterEmail) {
        IncidentReport report = IncidentReport.builder()
            .reporterId(reporterId)
            .reporterName(reporterName)
            .reporterEmail(reporterEmail)
            .title(request.getTitle())
            .description(request.getDescription())
            .category(request.getCategory())
            .priority(parsePriority(request.getPriority()))
            .status(IncidentReport.Status.PENDING)
            .location(request.getLocation())
            .vehicleId(request.getVehicleId())
            .vehiclePlate(request.getVehiclePlate())
            .stationId(request.getStationId())
            .stationName(request.getStationName())
            .build();
        
        IncidentReport saved = incidentReportRepository.save(report);
        return IncidentReportDTO.fromEntity(saved);
    }
    
    @Override
    public Page<IncidentReportDTO> getAllReports(Pageable pageable) {
        Page<IncidentReport> reports = incidentReportRepository.findAll(pageable);
        return reports.map(this::enrichWithAdminName);
    }
    
    @Override
    public Page<IncidentReportDTO> getReportsByReporter(Long reporterId, Pageable pageable) {
        Page<IncidentReport> reports = incidentReportRepository.findByReporterId(reporterId, pageable);
        return reports.map(this::enrichWithAdminName);
    }
    
    @Override
    public IncidentReportDTO getReportById(Long id) {
        IncidentReport report = incidentReportRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Không tìm thấy báo cáo sự cố với ID: " + id));
        return enrichWithAdminName(report);
    }
    
    @Override
    public IncidentReportDTO updateReport(Long id, UpdateIncidentReportRequest request) {
        IncidentReport report = incidentReportRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Không tìm thấy báo cáo sự cố với ID: " + id));
        
        if (request.getStatus() != null) {
            report.setStatus(IncidentReport.Status.valueOf(request.getStatus()));
            if (request.getStatus().equals("RESOLVED")) {
                report.setResolvedAt(LocalDateTime.now());
            }
        }
        
        if (request.getPriority() != null) {
            report.setPriority(IncidentReport.Priority.valueOf(request.getPriority()));
        }
        
        if (request.getAssignedTo() != null) {
            report.setAssignedTo(request.getAssignedTo());
        }
        
        if (request.getResolutionNote() != null) {
            report.setResolutionNote(request.getResolutionNote());
        }
        
        IncidentReport updated = incidentReportRepository.save(report);
        return enrichWithAdminName(updated);
    }
    
    @Override
    public IncidentReportDTO assignReport(Long id, Long adminId) {
        IncidentReport report = incidentReportRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Không tìm thấy báo cáo sự cố với ID: " + id));
        
        // Verify admin exists
        userRepository.findById(adminId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Không tìm thấy admin với ID: " + adminId));
        
        report.setAssignedTo(adminId);
        report.setStatus(IncidentReport.Status.IN_PROGRESS);
        
        IncidentReport updated = incidentReportRepository.save(report);
        return enrichWithAdminName(updated);
    }
    
    @Override
    public IncidentReportDTO resolveReport(Long id, String resolutionNote) {
        IncidentReport report = incidentReportRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Không tìm thấy báo cáo sự cố với ID: " + id));
        
        report.setStatus(IncidentReport.Status.RESOLVED);
        report.setResolutionNote(resolutionNote);
        report.setResolvedAt(LocalDateTime.now());
        
        IncidentReport updated = incidentReportRepository.save(report);
        return enrichWithAdminName(updated);
    }
    
    @Override
    public IncidentReportDTO closeReport(Long id) {
        IncidentReport report = incidentReportRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Không tìm thấy báo cáo sự cố với ID: " + id));
        
        report.setStatus(IncidentReport.Status.CLOSED);
        
        IncidentReport updated = incidentReportRepository.save(report);
        return enrichWithAdminName(updated);
    }
    
    @Override
    public void deleteReport(Long id) {
        if (!incidentReportRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Không tìm thấy báo cáo sự cố với ID: " + id);
        }
        incidentReportRepository.deleteById(id);
    }
    
    @Override
    public Page<IncidentReportDTO> searchReports(String status, String priority, String category, 
                                                 Long reporterId, String keyword, Pageable pageable) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            Page<IncidentReport> reports = incidentReportRepository.searchByKeyword(keyword, pageable);
            return reports.map(this::enrichWithAdminName);
        }
        
        IncidentReport.Status statusEnum = status != null ? IncidentReport.Status.valueOf(status) : null;
        IncidentReport.Priority priorityEnum = priority != null ? IncidentReport.Priority.valueOf(priority) : null;
        
        Page<IncidentReport> reports = incidentReportRepository.findWithFilters(
            statusEnum, priorityEnum, category, reporterId, pageable
        );
        return reports.map(this::enrichWithAdminName);
    }
    
    @Override
    public Map<String, Object> getReportStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("total", incidentReportRepository.count());
        stats.put("pending", incidentReportRepository.countByStatus(IncidentReport.Status.PENDING));
        stats.put("inProgress", incidentReportRepository.countByStatus(IncidentReport.Status.IN_PROGRESS));
        stats.put("resolved", incidentReportRepository.countByStatus(IncidentReport.Status.RESOLVED));
        stats.put("closed", incidentReportRepository.countByStatus(IncidentReport.Status.CLOSED));
        
        return stats;
    }
    
    @Override
    public List<IncidentReportDTO> getReportsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<IncidentReport> reports = incidentReportRepository.findByDateRange(startDate, endDate);
        return reports.stream()
            .map(this::enrichWithAdminName)
            .collect(Collectors.toList());
    }
    
    // Helper methods
    private IncidentReport.Priority parsePriority(String priority) {
        if (priority == null || priority.trim().isEmpty()) {
            return IncidentReport.Priority.MEDIUM;
        }
        try {
            return IncidentReport.Priority.valueOf(priority.toUpperCase());
        } catch (IllegalArgumentException e) {
            return IncidentReport.Priority.MEDIUM;
        }
    }
    
    private IncidentReportDTO enrichWithAdminName(IncidentReport report) {
        IncidentReportDTO dto = IncidentReportDTO.fromEntity(report);
        
        if (report.getAssignedTo() != null) {
            userRepository.findById(report.getAssignedTo())
                .ifPresent(admin -> dto.setAssignedToName(admin.getFullName()));
        }
        
        return dto;
    }
}
