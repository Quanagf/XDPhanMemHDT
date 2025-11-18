package com.evrental.users.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "complaints")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Người khiếu nại (Renter)
    
    @Column(nullable = false, length = 100)
    private String title; // Tiêu đề khiếu nại
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description; // Mô tả chi tiết
    
    @Column(name = "booking_id")
    private Long bookingId; // ID booking liên quan (nếu có)
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ComplaintCategory category = ComplaintCategory.OTHER; // Loại khiếu nại
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ComplaintStatus status = ComplaintStatus.PENDING; // Trạng thái
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ComplaintPriority priority = ComplaintPriority.MEDIUM; // Độ ưu tiên
    
    @Column(name = "assigned_to")
    private Long assignedTo; // ID của staff được giao xử lý
    
    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes; // Ghi chú của admin khi phân công
    
    @Column(columnDefinition = "TEXT")
    private String resolution; // Giải pháp/Phản hồi từ admin/staff
    
    @Column(name = "resolved_by")
    private Long resolvedBy; // ID của staff/admin đã xử lý
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt; // Thời gian xử lý xong
    
    @Column(name = "staff_completed_at")
    private LocalDateTime staffCompletedAt; // Thời gian staff đánh dấu hoàn thành
    
    @Column(name = "staff_notes", columnDefinition = "TEXT")
    private String staffNotes; // Ghi chú của staff khi hoàn thành
    
    @Column(name = "admin_approved_at")
    private LocalDateTime adminApprovedAt; // Thời gian admin duyệt
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Enums
    public enum ComplaintCategory {
        VEHICLE_ISSUE,      // Vấn đề về xe
        BILLING,            // Vấn đề thanh toán
        SERVICE_QUALITY,    // Chất lượng dịch vụ
        STAFF_BEHAVIOR,     // Thái độ nhân viên
        STATION_FACILITY,   // Cơ sở vật chất trạm
        APP_TECHNICAL,      // Lỗi kỹ thuật app
        OTHER               // Khác
    }
    
    public enum ComplaintStatus {
        PENDING,           // Chờ xử lý (admin chưa phân công)
        IN_PROGRESS,       // Đang xử lý (staff đang làm)
        STAFF_COMPLETED,   // Staff hoàn thành (chờ admin duyệt)
        RESOLVED,          // Đã giải quyết (admin đã duyệt)
        REJECTED,          // Từ chối (admin từ chối)
        CLOSED             // Đóng
    }
    
    public enum ComplaintPriority {
        LOW,
        MEDIUM,
        HIGH,
        URGENT
    }
}
