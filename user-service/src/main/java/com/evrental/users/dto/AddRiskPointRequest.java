package com.evrental.users.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddRiskPointRequest {
    
    @NotBlank(message = "Lý do không được để trống")
    private String reason;
    
    private Long bookingId; // Optional - reference to related booking
    
    private String details; // Additional details about the damage/issue
}
