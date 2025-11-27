package com.evrental.users.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.evrental.users.model.IncidentReport;

@Repository
public interface IncidentReportRepository extends JpaRepository<IncidentReport, Long> {
    
    // Tìm tất cả báo cáo của một nhân viên
    Page<IncidentReport> findByReporterId(Long reporterId, Pageable pageable);
    
    // Tìm theo trạng thái
    Page<IncidentReport> findByStatus(IncidentReport.Status status, Pageable pageable);
    
    // Tìm theo độ ưu tiên
    Page<IncidentReport> findByPriority(IncidentReport.Priority priority, Pageable pageable);
    
    // Tìm theo category
    Page<IncidentReport> findByCategory(String category, Pageable pageable);
    
    // Tìm báo cáo được gán cho admin cụ thể
    Page<IncidentReport> findByAssignedTo(Long assignedTo, Pageable pageable);
    
    // Đếm số báo cáo theo trạng thái
    long countByStatus(IncidentReport.Status status);
    
    // Đếm số báo cáo chưa xử lý
    @Query("SELECT COUNT(i) FROM IncidentReport i WHERE i.status = 'PENDING'")
    long countPendingReports();
    
    // Tìm báo cáo trong khoảng thời gian
    @Query("SELECT i FROM IncidentReport i WHERE i.createdAt BETWEEN :startDate AND :endDate")
    List<IncidentReport> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate);
    
    // Tìm kiếm báo cáo (theo title hoặc description)
    @Query("SELECT i FROM IncidentReport i WHERE " +
           "LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(i.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<IncidentReport> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    // Lấy báo cáo với filter phức tạp
    @Query("SELECT i FROM IncidentReport i WHERE " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:priority IS NULL OR i.priority = :priority) AND " +
           "(:category IS NULL OR i.category = :category) AND " +
           "(:reporterId IS NULL OR i.reporterId = :reporterId)")
    Page<IncidentReport> findWithFilters(
        @Param("status") IncidentReport.Status status,
        @Param("priority") IncidentReport.Priority priority,
        @Param("category") String category,
        @Param("reporterId") Long reporterId,
        Pageable pageable
    );
}
