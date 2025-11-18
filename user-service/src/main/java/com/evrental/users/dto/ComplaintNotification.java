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
public class ComplaintNotification {
    
    private Long complaintId;
    private String notificationType; // CREATED, ASSIGNED, RESOLVED, REJECTED
    private Long userId;
    private String userName;
    private String userEmail;
    private String title;
    private ComplaintCategory category;
    private ComplaintStatus status;
    private ComplaintPriority priority;
    private Long assignedTo;
    private String assignedToName;
    private Long resolvedBy;
    private String resolvedByName;
    private String resolution;
    private LocalDateTime timestamp;
}
