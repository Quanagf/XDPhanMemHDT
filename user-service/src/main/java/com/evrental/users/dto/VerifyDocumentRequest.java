package com.evrental.users.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyDocumentRequest {
    
    private String documentNumber; // Không bắt buộc khi REJECTED
    
    @Pattern(regexp = "^(APPROVED|REJECTED)$", message = "Action must be APPROVED or REJECTED")
    private String action; // "APPROVED" hoặc "REJECTED"
    
    private String rejectionReason; // Bắt buộc nếu action = REJECTED
}
