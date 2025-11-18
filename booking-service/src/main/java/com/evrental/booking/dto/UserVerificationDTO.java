package com.evrental.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO để nhận thông tin xác thực từ User Service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserVerificationDTO {
    private Long id;
    private String username;
    private String fullName;
    private String licenseNumber;
    private String identityNumber;
    private boolean hasVerifiedLicense;
    private boolean hasVerifiedIdentity;
}
