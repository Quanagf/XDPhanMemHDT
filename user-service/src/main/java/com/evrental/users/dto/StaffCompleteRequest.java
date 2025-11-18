package com.evrental.users.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffCompleteRequest {
    
    @NotBlank(message = "Ghi chú không được để trống")
    private String staffNotes; // Ghi chú của staff về công việc đã làm
}
