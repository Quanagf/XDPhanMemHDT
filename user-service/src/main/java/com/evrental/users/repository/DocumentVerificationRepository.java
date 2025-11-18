package com.evrental.users.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.evrental.users.model.DocumentVerification;
import com.evrental.users.model.DocumentVerification.DocumentType;
import com.evrental.users.model.DocumentVerification.VerificationStatus;

@Repository
public interface DocumentVerificationRepository extends JpaRepository<DocumentVerification, Long> {
    
    // Tìm tất cả documents của một user
    List<DocumentVerification> findByUserId(Long userId);
    
    // Tìm document theo user và loại
    Optional<DocumentVerification> findByUserIdAndDocumentType(Long userId, DocumentType documentType);
    
    // Tìm tất cả documents theo user và loại (có thể nhiều bản ghi)
    List<DocumentVerification> findAllByUserIdAndDocumentType(Long userId, DocumentType documentType);
    
    // Tìm tất cả documents theo trạng thái
    List<DocumentVerification> findByStatus(VerificationStatus status);
    
    // Tìm documents đang chờ xác thực
    List<DocumentVerification> findByStatusOrderByCreatedAtAsc(VerificationStatus status);
    
    // Kiểm tra xem user đã có document type này chưa
    boolean existsByUserIdAndDocumentType(Long userId, DocumentType documentType);
    
    // Xóa tất cả documents của user theo loại
    void deleteByUserIdAndDocumentType(Long userId, DocumentType documentType);
}
