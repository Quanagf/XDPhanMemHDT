package com.evrental.users.dto;

import com.evrental.users.model.Complaint.ComplaintCategory;
import com.evrental.users.model.Complaint.ComplaintPriority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintRequest {
    
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;
    
    @NotBlank(message = "Mô tả không được để trống")
    private String description;
    
    private Long bookingId; // Optional
    
    @NotNull(message = "Danh mục không được để trống")
    private ComplaintCategory category;
    
    private ComplaintPriority priority; // Optional, sẽ default là MEDIUM
}
