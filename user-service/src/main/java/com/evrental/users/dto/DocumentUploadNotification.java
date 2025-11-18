package com.evrental.users.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentUploadNotification {
    private Long userId;
    private String username;
    private String fullName;
    private String documentType; // "LICENSE" or "IDENTITY"
    private String imageUrl;
    private Long verificationId;
}
