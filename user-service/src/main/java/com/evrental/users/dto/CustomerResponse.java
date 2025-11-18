package com.evrental.users.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerResponse {
    
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private Integer riskPoints;
    private Boolean isRisky;
    private Long totalBookings;
    private Long completedBookings;
    private Long totalComplaints;
    private LocalDateTime createdAt;
}
