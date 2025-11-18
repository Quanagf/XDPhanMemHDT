package com.evrental.users.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.evrental.users.model.Complaint;
import com.evrental.users.model.Complaint.ComplaintStatus;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    
    // Tìm tất cả complaints của một user
    List<Complaint> findByUserId(Long userId);
    
    // Tìm theo status
    List<Complaint> findByStatus(ComplaintStatus status);
    
    // Tìm complaints được giao cho staff
    List<Complaint> findByAssignedTo(Long staffId);
    
    // Đếm số complaints theo status
    long countByStatus(ComplaintStatus status);
    
    // Đếm số complaints của user
    long countByUserId(Long userId);
    
    // Tìm theo status và sắp xếp theo thời gian tạo
    List<Complaint> findByStatusOrderByCreatedAtDesc(ComplaintStatus status);
    
    // Lấy tất cả complaints sắp xếp theo thời gian
    List<Complaint> findAllByOrderByCreatedAtDesc();
    
    // Thống kê số lượng complaints theo category
    @Query("SELECT c.category, COUNT(c) FROM Complaint c GROUP BY c.category")
    List<Object[]> countByCategory();
}
