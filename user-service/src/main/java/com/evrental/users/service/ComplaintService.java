package com.evrental.users.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.evrental.users.dto.ComplaintRequest;
import com.evrental.users.dto.ComplaintResponse;
import com.evrental.users.dto.ComplaintNotification;
import com.evrental.users.dto.ResolveComplaintRequest;
import com.evrental.users.model.Complaint;
import com.evrental.users.model.Complaint.ComplaintCategory;
import com.evrental.users.model.Complaint.ComplaintStatus;
import com.evrental.users.model.User;
import com.evrental.users.repository.ComplaintRepository;
import com.evrental.users.repository.UserRepository;

@Service
@Transactional
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RabbitMQProducer rabbitMQProducer;

    // Create a new complaint
    public ComplaintResponse createComplaint(Long userId, ComplaintRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        Complaint complaint = Complaint.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .bookingId(request.getBookingId())
                .category(request.getCategory())
                .priority(request.getPriority() != null ? request.getPriority() : Complaint.ComplaintPriority.MEDIUM)
                .status(ComplaintStatus.PENDING)
                .build();

        complaint = complaintRepository.save(complaint);
        
        // Send RabbitMQ notification to admin
        sendComplaintCreatedNotification(complaint, user);
        
        return convertToResponse(complaint);
    }

    // Get all complaints for a specific user
    public List<ComplaintResponse> getUserComplaints(Long userId) {
        List<Complaint> complaints = complaintRepository.findByUserId(userId);
        return complaints.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get all complaints (for admin)
    public List<ComplaintResponse> getAllComplaints() {
        List<Complaint> complaints = complaintRepository.findAllByOrderByCreatedAtDesc();
        return complaints.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get complaints by status
    public List<ComplaintResponse> getComplaintsByStatus(ComplaintStatus status) {
        List<Complaint> complaints = complaintRepository.findByStatusOrderByCreatedAtDesc(status);
        return complaints.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Assign complaint to a staff member
    public ComplaintResponse assignComplaint(Long complaintId, Long staffId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Khiếu nại không tồn tại"));

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại"));

        // Check if staff has ADMIN or STAFF role
        if (!staff.getRole().equals(User.Role.ADMIN) && !staff.getRole().equals(User.Role.STAFF)) {
            throw new RuntimeException("Chỉ có thể giao cho Admin hoặc Staff");
        }

        complaint.setAssignedTo(staffId);
        complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        complaint = complaintRepository.save(complaint);
        
        // Send RabbitMQ notification to assigned staff
        sendComplaintAssignedNotification(complaint, staff);

        return convertToResponse(complaint);
    }

    // Resolve or reject a complaint
    public ComplaintResponse resolveComplaint(Long complaintId, ResolveComplaintRequest request, Long resolvedBy) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Khiếu nại không tồn tại"));

        User resolver = userRepository.findById(resolvedBy)
                .orElseThrow(() -> new RuntimeException("Người giải quyết không tồn tại"));

        // Check if resolver has ADMIN or STAFF role
        if (!resolver.getRole().equals(User.Role.ADMIN) && !resolver.getRole().equals(User.Role.STAFF)) {
            throw new RuntimeException("Chỉ Admin hoặc Staff mới có thể giải quyết khiếu nại");
        }

        // Validate status
        if (request.getStatus() != ComplaintStatus.RESOLVED && request.getStatus() != ComplaintStatus.REJECTED) {
            throw new RuntimeException("Trạng thái phải là RESOLVED hoặc REJECTED");
        }

        complaint.setStatus(request.getStatus());
        complaint.setResolution(request.getResolution());
        complaint.setResolvedBy(resolvedBy);
        complaint.setResolvedAt(LocalDateTime.now());

        complaint = complaintRepository.save(complaint);
        
        // Send RabbitMQ notification to user
        sendComplaintResolvedNotification(complaint, resolver);
        
        return convertToResponse(complaint);
    }

    // Close a complaint (user accepted the resolution)
    public ComplaintResponse closeComplaint(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Khiếu nại không tồn tại"));

        if (complaint.getStatus() != ComplaintStatus.RESOLVED) {
            throw new RuntimeException("Chỉ có thể đóng khiếu nại đã được giải quyết");
        }

        complaint.setStatus(ComplaintStatus.CLOSED);
        complaint = complaintRepository.save(complaint);

        return convertToResponse(complaint);
    }

    // Get complaint statistics
    public Map<String, Object> getComplaintStatistics() {
        Map<String, Object> stats = new HashMap<>();

        // Total complaints
        long totalComplaints = complaintRepository.count();
        stats.put("totalComplaints", totalComplaints);

        // Count by status
        stats.put("pendingCount", complaintRepository.countByStatus(ComplaintStatus.PENDING));
        stats.put("inProgressCount", complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS));
        stats.put("resolvedCount", complaintRepository.countByStatus(ComplaintStatus.RESOLVED));
        stats.put("rejectedCount", complaintRepository.countByStatus(ComplaintStatus.REJECTED));
        stats.put("closedCount", complaintRepository.countByStatus(ComplaintStatus.CLOSED));

        // Count by category
        List<Object[]> categoryStats = complaintRepository.countByCategory();
        Map<ComplaintCategory, Long> categoryMap = new HashMap<>();
        for (Object[] row : categoryStats) {
            categoryMap.put((ComplaintCategory) row[0], (Long) row[1]);
        }
        stats.put("categoryStats", categoryMap);

        return stats;
    }

    // Helper method to convert Complaint to ComplaintResponse
    private ComplaintResponse convertToResponse(Complaint complaint) {
        ComplaintResponse response = ComplaintResponse.builder()
                .id(complaint.getId())
                .userId(complaint.getUser().getId())
                .userName(complaint.getUser().getUsername())
                .userEmail(complaint.getUser().getEmail())
                .userFullName(complaint.getUser().getFullName())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .bookingId(complaint.getBookingId())
                .category(complaint.getCategory())
                .status(complaint.getStatus())
                .priority(complaint.getPriority())
                .assignedTo(complaint.getAssignedTo())
                .resolution(complaint.getResolution())
                .resolvedBy(complaint.getResolvedBy())
                .resolvedAt(complaint.getResolvedAt())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();

        // Get assigned staff name if exists
        if (complaint.getAssignedTo() != null) {
            userRepository.findById(complaint.getAssignedTo())
                    .ifPresent(staff -> response.setAssignedToName(staff.getFullName()));
        }

        // Get resolver name if exists
        if (complaint.getResolvedBy() != null) {
            userRepository.findById(complaint.getResolvedBy())
                    .ifPresent(resolver -> response.setResolvedByName(resolver.getFullName()));
        }

        return response;
    }
    
    // Helper methods for sending RabbitMQ notifications
    
    private void sendComplaintCreatedNotification(Complaint complaint, User user) {
        ComplaintNotification notification = ComplaintNotification.builder()
                .complaintId(complaint.getId())
                .notificationType("CREATED")
                .userId(user.getId())
                .userName(user.getUsername())
                .userEmail(user.getEmail())
                .title(complaint.getTitle())
                .category(complaint.getCategory())
                .status(complaint.getStatus())
                .priority(complaint.getPriority())
                .timestamp(LocalDateTime.now())
                .build();
        
        rabbitMQProducer.sendComplaintCreatedNotification(notification);
    }
    
    private void sendComplaintAssignedNotification(Complaint complaint, User staff) {
        ComplaintNotification notification = ComplaintNotification.builder()
                .complaintId(complaint.getId())
                .notificationType("ASSIGNED")
                .userId(complaint.getUser().getId())
                .userName(complaint.getUser().getUsername())
                .userEmail(complaint.getUser().getEmail())
                .title(complaint.getTitle())
                .category(complaint.getCategory())
                .status(complaint.getStatus())
                .priority(complaint.getPriority())
                .assignedTo(staff.getId())
                .assignedToName(staff.getFullName())
                .timestamp(LocalDateTime.now())
                .build();
        
        rabbitMQProducer.sendComplaintAssignedNotification(notification);
    }
    
    private void sendComplaintResolvedNotification(Complaint complaint, User resolver) {
        ComplaintNotification notification = ComplaintNotification.builder()
                .complaintId(complaint.getId())
                .notificationType(complaint.getStatus() == ComplaintStatus.RESOLVED ? "RESOLVED" : "REJECTED")
                .userId(complaint.getUser().getId())
                .userName(complaint.getUser().getUsername())
                .userEmail(complaint.getUser().getEmail())
                .title(complaint.getTitle())
                .category(complaint.getCategory())
                .status(complaint.getStatus())
                .priority(complaint.getPriority())
                .resolvedBy(resolver.getId())
                .resolvedByName(resolver.getFullName())
                .resolution(complaint.getResolution())
                .timestamp(LocalDateTime.now())
                .build();
        
        rabbitMQProducer.sendComplaintResolvedNotification(notification);
    }
}
