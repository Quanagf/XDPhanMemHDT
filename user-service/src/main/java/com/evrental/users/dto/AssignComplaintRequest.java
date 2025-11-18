package com.evrental.users.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignComplaintRequest {
    
    @NotNull(message = "Staff ID không được để trống")
    private Long staffId;
    
    private String adminNotes; // Ghi chú của admin khi phân công
}
