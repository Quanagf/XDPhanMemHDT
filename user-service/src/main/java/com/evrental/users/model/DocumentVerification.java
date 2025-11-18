package com.evrental.users.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "document_verifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentVerification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentType documentType;
    
    @Column(nullable = false)
    private String imageUrl; // URL ảnh tạm trong MinIO
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus status;
    
    @Column(length = 12)
    private String documentNumber; // Số GPLX hoặc CCCD do admin nhập
    
    @Column(length = 1000)
    private String rejectionReason; // Lý do từ chối (nếu có)
    
    @Column(name = "verified_by")
    private Long verifiedBy; // ID của admin xác thực
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = VerificationStatus.PENDING;
        }
    }
    
    public enum DocumentType {
        LICENSE,    // Giấy phép lái xe
        IDENTITY    // Căn cước công dân
    }
    
    public enum VerificationStatus {
        PENDING,    // Đang chờ xác thực
        APPROVED,   // Đã được xác thực
        REJECTED    // Bị từ chối
    }
}
