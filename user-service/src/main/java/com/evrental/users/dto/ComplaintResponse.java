package com.evrental.users.dto;

import java.time.LocalDateTime;

import com.evrental.users.model.Complaint.ComplaintCategory;
import com.evrental.users.model.Complaint.ComplaintPriority;
import com.evrental.users.model.Complaint.ComplaintStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponse {
    
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userFullName;
    private String title;
    private String description;
    private Long bookingId;
    private ComplaintCategory category;
    private ComplaintStatus status;
    private ComplaintPriority priority;
    private Long assignedTo;
    private String assignedToName;
    private String resolution;
    private Long resolvedBy;
    private String resolvedByName;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
