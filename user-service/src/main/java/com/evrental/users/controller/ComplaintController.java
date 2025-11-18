package com.evrental.users.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<?> assignComplaint(
            @PathVariable Long id,
            @RequestBody Map<String, Long> request) {
        try {
            Long staffId = request.get("staffId");
            if (staffId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Staff ID is required"));
            }
            ComplaintResponse response = complaintService.assignComplaint(id, staffId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Resolve or reject a complaint
    @PostMapping("/admin/complaints/{id}/resolve")
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
    public ResponseEntity<?> getComplaintStatistics() {
        try {
            Map<String, Object> stats = complaintService.getComplaintStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
