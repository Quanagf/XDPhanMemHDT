package com.evrental.users.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.evrental.users.dto.AddRiskPointRequest;
import com.evrental.users.dto.CustomerRequest;
import com.evrental.users.dto.CustomerResponse;
import com.evrental.users.dto.UpdateCustomerRequest;
import com.evrental.users.model.RiskPointHistory;
import com.evrental.users.service.CustomerService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    // Create a new customer
    @PostMapping
    public ResponseEntity<?> createCustomer(@Valid @RequestBody CustomerRequest request) {
        try {
            CustomerResponse response = customerService.createCustomer(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get all customers with optional filter by risky status
    @GetMapping
    public ResponseEntity<?> getAllCustomers(
            @RequestParam(required = false) Boolean isRisky) {
        try {
            List<CustomerResponse> customers = customerService.getAllCustomers(isRisky);
            return ResponseEntity.ok(customers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get customer by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable Long id) {
        try {
            CustomerResponse customer = customerService.getCustomerById(id);
            return ResponseEntity.ok(customer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Update customer information
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCustomerRequest request) {
        try {
            CustomerResponse response = customerService.updateCustomer(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Delete/Ban a customer
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        try {
            customerService.deleteCustomer(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa khách hàng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Add risk point to customer
    @PostMapping("/{id}/risk-point")
    public ResponseEntity<?> addRiskPoint(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long addedBy,
            @Valid @RequestBody AddRiskPointRequest request) {
        try {
            CustomerResponse response = customerService.addRiskPoint(id, request, addedBy);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Reset risk points
    @PostMapping("/{id}/reset-risk")
    public ResponseEntity<?> resetRiskPoints(@PathVariable Long id) {
        try {
            CustomerResponse response = customerService.resetRiskPoints(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get risk point history for a customer
    @GetMapping("/{id}/risk-history")
    public ResponseEntity<?> getRiskPointHistory(@PathVariable Long id) {
        try {
            List<RiskPointHistory> history = customerService.getRiskPointHistory(id);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get customer statistics
    @GetMapping("/statistics")
    public ResponseEntity<?> getCustomerStatistics() {
        try {
            Map<String, Object> stats = customerService.getCustomerStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
