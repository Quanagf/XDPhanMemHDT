package com.evrental.users.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.evrental.users.dto.DocumentUploadNotification;
import com.evrental.users.dto.DocumentVerificationResponse;
import com.evrental.users.dto.VerifyDocumentRequest;
import com.evrental.users.model.DocumentVerification;
import com.evrental.users.model.DocumentVerification.DocumentType;
import com.evrental.users.model.DocumentVerification.VerificationStatus;
import com.evrental.users.model.User;
import com.evrental.users.repository.DocumentVerificationRepository;
import com.evrental.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentVerificationService {
    
    private final DocumentVerificationRepository documentVerificationRepository;
    private final UserRepository userRepository;
    private final RabbitMQProducer rabbitMQProducer;
    
    /**
     * Tạo document verification request mới khi user upload ảnh
     */
    @Transactional
    public DocumentVerification createVerificationRequest(Long userId, DocumentType documentType, String imageUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Xóa TẤT CẢ verification cũ nếu có (tránh duplicate)
        List<DocumentVerification> existingVerifications = 
                documentVerificationRepository.findAllByUserIdAndDocumentType(userId, documentType);
        
        if (!existingVerifications.isEmpty()) {
            log.info("Deleting {} old verification requests for user: {}, documentType: {}", 
                    existingVerifications.size(), user.getUsername(), documentType);
            documentVerificationRepository.deleteAll(existingVerifications);
            
            // Reset số GPLX/CCCD về null khi upload lại
            if (documentType == DocumentType.LICENSE) {
                user.setLicenseNumber(null);
                log.info("Reset licenseNumber to null for user: {}", user.getUsername());
            } else if (documentType == DocumentType.IDENTITY) {
                user.setIdentityNumber(null);
                log.info("Reset identityNumber to null for user: {}", user.getUsername());
            }
            userRepository.save(user);
        }
        
        // Tạo verification request mới
        DocumentVerification verification = DocumentVerification.builder()
                .user(user)
                .documentType(documentType)
                .imageUrl(imageUrl)
                .status(VerificationStatus.PENDING)
                .build();
        
        verification = documentVerificationRepository.save(verification);
        
        // Gửi notification qua RabbitMQ để thông báo cho admin
        DocumentUploadNotification notification = DocumentUploadNotification.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .documentType(documentType.name())
                .imageUrl(imageUrl)
                .verificationId(verification.getId())
                .build();
        
        rabbitMQProducer.sendDocumentUploadNotification(notification);
        
        log.info("Created verification request ID: {} for user: {}", verification.getId(), user.getUsername());
        
        return verification;
    }
    
    /**
     * Lấy TẤT CẢ documents (PENDING, APPROVED, REJECTED) - cho admin
     */
    public List<DocumentVerificationResponse> getAllVerifications() {
        List<DocumentVerification> allDocs = documentVerificationRepository.findAll();
        
        return allDocs.stream()
                .map(this::mapToResponse)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt())) // Mới nhất lên đầu
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy tất cả documents đang chờ xác thực (cho admin)
     */
    public List<DocumentVerificationResponse> getPendingVerifications() {
        List<DocumentVerification> pendingDocs = documentVerificationRepository
                .findByStatusOrderByCreatedAtAsc(VerificationStatus.PENDING);
        
        return pendingDocs.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy verification status của user (cho renter)
     */
    public List<DocumentVerificationResponse> getUserVerifications(Long userId) {
        List<DocumentVerification> userDocs = documentVerificationRepository.findByUserId(userId);
        
        return userDocs.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Admin xác thực document
     */
    @Transactional
    public DocumentVerification verifyDocument(Long verificationId, VerifyDocumentRequest request, Long adminId) {
        DocumentVerification verification = documentVerificationRepository.findById(verificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Verification request not found"));
        
        if (verification.getStatus() != VerificationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This verification has already been processed");
        }
        
        // Validate based on action
        if ("APPROVED".equals(request.getAction())) {
            if (request.getDocumentNumber() == null || request.getDocumentNumber().trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document number is required when approving");
            }
        } else if ("REJECTED".equals(request.getAction())) {
            if (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required when rejecting");
            }
        }
        
        // Update verification
        verification.setStatus(VerificationStatus.valueOf(request.getAction()));
        verification.setDocumentNumber(request.getDocumentNumber());
        verification.setRejectionReason(request.getRejectionReason());
        verification.setVerifiedBy(adminId);
        verification.setVerifiedAt(LocalDateTime.now());
        
        verification = documentVerificationRepository.save(verification);
        
        // Nếu approved, cập nhật thông tin user
        if (verification.getStatus() == VerificationStatus.APPROVED) {
            User user = verification.getUser();
            if (verification.getDocumentType() == DocumentType.LICENSE) {
                user.setLicenseNumber(request.getDocumentNumber());
                user.setLicenseImage(verification.getImageUrl());
            } else {
                user.setIdentityNumber(request.getDocumentNumber());
                user.setIdentityImage(verification.getImageUrl());
            }
            userRepository.save(user);
        }
        
        // Gửi notification cho renter
        DocumentUploadNotification notification = DocumentUploadNotification.builder()
                .userId(verification.getUser().getId())
                .username(verification.getUser().getUsername())
                .fullName(verification.getUser().getFullName())
                .documentType(verification.getDocumentType().name())
                .imageUrl(verification.getImageUrl())
                .verificationId(verification.getId())
                .build();
        
        rabbitMQProducer.sendDocumentVerifiedNotification(notification);
        
        log.info("Document verification ID: {} has been {}", verificationId, request.getAction());
        
        return verification;
    }
    
    private DocumentVerificationResponse mapToResponse(DocumentVerification verification) {
        User user = verification.getUser();
        return DocumentVerificationResponse.builder()
                .id(verification.getId())
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .documentType(verification.getDocumentType().name())
                .imageUrl(verification.getImageUrl())
                .status(verification.getStatus().name())
                .documentNumber(verification.getDocumentNumber())
                .rejectionReason(verification.getRejectionReason())
                .createdAt(verification.getCreatedAt())
                .verifiedAt(verification.getVerifiedAt())
                .currentLicenseNumber(user.getLicenseNumber())
                .currentIdentityNumber(user.getIdentityNumber())
                .build();
    }
}
