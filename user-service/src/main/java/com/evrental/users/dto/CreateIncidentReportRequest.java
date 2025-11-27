package com.evrental.users.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateIncidentReportRequest {
    
    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 500, message = "Tiêu đề không được vượt quá 500 ký tự")
    private String title;
    
    @NotBlank(message = "Mô tả không được để trống")
    private String description;
    
    @NotBlank(message = "Danh mục không được để trống")
    private String category; // VEHICLE_ISSUE, CUSTOMER_COMPLAINT, SYSTEM_ERROR, SAFETY_CONCERN, OTHER
    
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL
    
    private String location;
    
    private Long vehicleId;
    
    private String vehiclePlate;
    
    private Long stationId;
    
    private String stationName;
}
