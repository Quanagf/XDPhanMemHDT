package com.evrental.users.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateIncidentReportRequest {
    
    private String status; // PENDING, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL
    
    private Long assignedTo; // Admin ID
    
    private String resolutionNote;
}
