package com.evrental.users.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.evrental.users.dto.AssignComplaintRequest;
import com.evrental.users.dto.ComplaintRequest;
import com.evrental.users.dto.ComplaintResponse;
import com.evrental.users.dto.ResolveComplaintRequest;
import com.evrental.users.model.Complaint.ComplaintStatus;
import com.evrental.users.service.ComplaintService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    // Create a new complaint (for renters)
    @PostMapping("/complaints")
    public ResponseEntity<?> createComplaint(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ComplaintRequest request) {
        try {
            ComplaintResponse response = complaintService.createComplaint(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get all complaints for the current user
    @GetMapping("/my-complaints")
    public ResponseEntity<?> getMyComplaints(@RequestHeader("X-User-Id") Long userId) {
        try {
            List<ComplaintResponse> complaints = complaintService.getUserComplaints(userId);
            return ResponseEntity.ok(complaints);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get a specific complaint by ID
    @GetMapping("/complaints/{id}")
    public ResponseEntity<?> getComplaintById(@PathVariable Long id) {
        try {
            // This would need to be implemented in the service
            return ResponseEntity.ok(Map.of("message", "Get complaint by ID - to be implemented"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Close a complaint (user accepts resolution)
    @PostMapping("/complaints/{id}/close")
    public ResponseEntity<?> closeComplaint(@PathVariable Long id) {
        try {
            ComplaintResponse response = complaintService.closeComplaint(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ============ ADMIN/STAFF ENDPOINTS ============

    // Get all complaints (admin/staff)
    @GetMapping("/admin/complaints")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<?> getAllComplaints(
            @RequestParam(required = false) ComplaintStatus status) {
        try {
            List<ComplaintResponse> complaints;
            if (status != null) {
                complaints = complaintService.getComplaintsByStatus(status);
            } else {
                complaints = complaintService.getAllComplaints();
            }
            return ResponseEntity.ok(complaints);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Assign complaint to staff
    @PostMapping("/admin/complaints/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignComplaint(
            @PathVariable Long id,
            @Valid @RequestBody AssignComplaintRequest request) {
        try {
            ComplaintResponse response = complaintService.assignComplaint(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Resolve or reject a complaint
    @PostMapping("/admin/complaints/{id}/resolve")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<?> resolveComplaint(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long resolvedBy,
            @Valid @RequestBody ResolveComplaintRequest request) {
        try {
            ComplaintResponse response = complaintService.resolveComplaint(id, request, resolvedBy);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get complaint statistics
    @GetMapping("/admin/complaints/statistics")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<?> getComplaintStatistics() {
        try {
            Map<String, Object> stats = complaintService.getComplaintStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // ============ STAFF ENDPOINTS ============
    
    // Staff marks complaint as completed
    @PostMapping("/staff/complaints/{id}/complete")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<?> staffCompleteComplaint(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long staffId,
            @Valid @RequestBody Map<String, String> request) {
        try {
            String staffNotes = request.get("staffNotes");
            if (staffNotes == null || staffNotes.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ghi chú không được để trống"));
            }
            ComplaintResponse response = complaintService.staffCompleteComplaint(id, staffId, staffNotes);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Admin approves staff's work
    @PostMapping("/admin/complaints/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminApproveComplaint(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long adminId,
            @Valid @RequestBody Map<String, String> request) {
        try {
            String resolution = request.get("resolution");
            if (resolution == null || resolution.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Kết luận không được để trống"));
            }
            ComplaintResponse response = complaintService.adminApproveComplaint(id, adminId, resolution);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Admin rejects complaint
    @PostMapping("/admin/complaints/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminRejectComplaint(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long adminId,
            @Valid @RequestBody Map<String, String> request) {
        try {
            String reason = request.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Lý do không được để trống"));
            }
            ComplaintResponse response = complaintService.adminRejectComplaint(id, adminId, reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

