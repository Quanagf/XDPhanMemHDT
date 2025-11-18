package com.evrental.users.dto;

import com.evrental.users.model.Complaint.ComplaintStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResolveComplaintRequest {
    
    @NotNull(message = "Trạng thái không được để trống")
    private ComplaintStatus status; // RESOLVED or REJECTED
    
    @NotBlank(message = "Nội dung giải quyết không được để trống")
    private String resolution;
    
    private String rejectionReason; // Optional, used when status is REJECTED
}
