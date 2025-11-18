package com.evrental.users.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.evrental.users.dto.AddRiskPointRequest;
import com.evrental.users.dto.CustomerRequest;
import com.evrental.users.dto.CustomerResponse;
import com.evrental.users.dto.UpdateCustomerRequest;
import com.evrental.users.model.RiskPointHistory;
import com.evrental.users.model.User;
import com.evrental.users.repository.ComplaintRepository;
import com.evrental.users.repository.RiskPointHistoryRepository;
import com.evrental.users.repository.UserRepository;

@Service
@Transactional
public class CustomerService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private RiskPointHistoryRepository riskPointHistoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Create a new customer (RENTER role only)
    public CustomerResponse createCustomer(CustomerRequest request) {
        // Validate unique constraints
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Số điện thoại đã được sử dụng");
        }

        User customer = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .role(User.Role.RENTER)
                .riskPoints(0)
                .isRisky(false)
                .totalSpent(BigDecimal.ZERO)
                .build();

        customer = userRepository.save(customer);
        return convertToResponse(customer);
    }

    // Get all customers (RENTER role)
    public List<CustomerResponse> getAllCustomers(Boolean isRisky) {
        List<User> customers;
        if (isRisky != null) {
            customers = userRepository.findByRoleAndIsRisky(User.Role.RENTER, isRisky);
        } else {
            customers = userRepository.findByRole(User.Role.RENTER);
        }

        return customers.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get customer by ID
    public CustomerResponse getCustomerById(Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại"));

        if (!customer.getRole().equals(User.Role.RENTER)) {
            throw new RuntimeException("Người dùng này không phải là khách hàng");
        }

        return convertToResponse(customer);
    }

    // Update customer information
    public CustomerResponse updateCustomer(Long customerId, UpdateCustomerRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại"));

        if (!customer.getRole().equals(User.Role.RENTER)) {
            throw new RuntimeException("Người dùng này không phải là khách hàng");
        }

        // Update fields if provided
        if (request.getFullName() != null && !request.getFullName().isEmpty()) {
            customer.setFullName(request.getFullName());
        }

        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            if (!customer.getEmail().equals(request.getEmail()) && 
                userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email đã được sử dụng");
            }
            customer.setEmail(request.getEmail());
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty()) {
            if (!customer.getPhoneNumber().equals(request.getPhoneNumber()) && 
                userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                throw new RuntimeException("Số điện thoại đã được sử dụng");
            }
            customer.setPhoneNumber(request.getPhoneNumber());
        }

        if (request.getAddress() != null) {
            customer.setAddress(request.getAddress());
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            customer.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        customer = userRepository.save(customer);
        return convertToResponse(customer);
    }

    // Delete/Ban a customer
    public void deleteCustomer(Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại"));

        if (!customer.getRole().equals(User.Role.RENTER)) {
            throw new RuntimeException("Người dùng này không phải là khách hàng");
        }

        userRepository.delete(customer);
    }

    // Add risk point to customer
    public CustomerResponse addRiskPoint(Long customerId, AddRiskPointRequest request, Long addedBy) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại"));

        if (!customer.getRole().equals(User.Role.RENTER)) {
            throw new RuntimeException("Người dùng này không phải là khách hàng");
        }

        Integer pointsBefore = customer.getRiskPoints();
        Integer pointsAfter = Math.min(pointsBefore + 1, 3); // Max 3 points
        Boolean becameRisky = false;

        customer.setRiskPoints(pointsAfter);

        // Auto-set isRisky when reaching 3 points
        if (pointsAfter >= 3 && !customer.getIsRisky()) {
            customer.setIsRisky(true);
            becameRisky = true;
        }

        customer = userRepository.save(customer);

        // Record in history
        RiskPointHistory history = RiskPointHistory.builder()
                .user(customer)
                .reason(request.getReason())
                .bookingId(request.getBookingId())
                .details(request.getDetails())
                .addedBy(addedBy)
                .pointsBefore(pointsBefore)
                .pointsAfter(pointsAfter)
                .becameRisky(becameRisky)
                .build();

        riskPointHistoryRepository.save(history);

        return convertToResponse(customer);
    }

    // Reset risk points (admin action)
    public CustomerResponse resetRiskPoints(Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại"));

        if (!customer.getRole().equals(User.Role.RENTER)) {
            throw new RuntimeException("Người dùng này không phải là khách hàng");
        }

        customer.setRiskPoints(0);
        customer.setIsRisky(false);
        customer = userRepository.save(customer);

        return convertToResponse(customer);
    }

    // Get risk point history for a customer
    public List<RiskPointHistory> getRiskPointHistory(Long customerId) {
        return riskPointHistoryRepository.findByUserIdOrderByCreatedAtDesc(customerId);
    }

    // Get customer statistics
    public Map<String, Object> getCustomerStatistics() {
        Map<String, Object> stats = new HashMap<>();

        long totalCustomers = userRepository.countByRole(User.Role.RENTER);
        long riskyCustomers = userRepository.countByRoleAndIsRisky(User.Role.RENTER, true);
        long normalCustomers = totalCustomers - riskyCustomers;

        stats.put("totalCustomers", totalCustomers);
        stats.put("riskyCustomers", riskyCustomers);
        stats.put("normalCustomers", normalCustomers);
        stats.put("riskyPercentage", totalCustomers > 0 ? (riskyCustomers * 100.0 / totalCustomers) : 0);

        // Get complaint statistics by category
        List<Object[]> categoryStats = complaintRepository.countByCategory();
        Map<String, Long> complaintsByCategory = new HashMap<>();
        for (Object[] row : categoryStats) {
            complaintsByCategory.put(row[0].toString(), (Long) row[1]);
        }
        stats.put("complaintsByCategory", complaintsByCategory);

        return stats;
    }

    // Helper method to convert User to CustomerResponse
    private CustomerResponse convertToResponse(User user) {
        return CustomerResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .riskPoints(user.getRiskPoints())
                .isRisky(user.getIsRisky())
                .totalComplaints(complaintRepository.countByUserId(user.getId()))
                .createdAt(user.getCreatedAt())
                .build();
    }
}
