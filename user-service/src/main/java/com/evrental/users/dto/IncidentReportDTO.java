package com.evrental.users.dto;

import java.time.LocalDateTime;

import com.evrental.users.model.IncidentReport;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentReportDTO {
    
    private Long id;
    private Long reporterId;
    private String reporterName;
    private String reporterEmail;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private String location;
    private Long vehicleId;
    private String vehiclePlate;
    private Long stationId;
    private String stationName;
    private Long assignedTo;
    private String assignedToName; // Tên admin được gán
    private String resolutionNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    
    // Convert from Entity
    public static IncidentReportDTO fromEntity(IncidentReport report) {
        return IncidentReportDTO.builder()
            .id(report.getId())
            .reporterId(report.getReporterId())
            .reporterName(report.getReporterName())
            .reporterEmail(report.getReporterEmail())
            .title(report.getTitle())
            .description(report.getDescription())
            .category(report.getCategory())
            .priority(report.getPriority().name())
            .status(report.getStatus().name())
            .location(report.getLocation())
            .vehicleId(report.getVehicleId())
            .vehiclePlate(report.getVehiclePlate())
            .stationId(report.getStationId())
            .stationName(report.getStationName())
            .assignedTo(report.getAssignedTo())
            .resolutionNote(report.getResolutionNote())
            .createdAt(report.getCreatedAt())
            .updatedAt(report.getUpdatedAt())
            .resolvedAt(report.getResolvedAt())
            .build();
    }
}
