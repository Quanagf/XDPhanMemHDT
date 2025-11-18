package com.evrental.users.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentVerificationResponse {
    private Long id;
    private Long userId;
    private String username;
    private String fullName;
    private String documentType; // "LICENSE" hoặc "IDENTITY"
    private String imageUrl;
    private String status; // "PENDING", "APPROVED", "REJECTED"
    private String documentNumber;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime verifiedAt;
    private String currentLicenseNumber; // Số GPLX hiện tại của user
    private String currentIdentityNumber; // Số CCCD hiện tại của user
}
