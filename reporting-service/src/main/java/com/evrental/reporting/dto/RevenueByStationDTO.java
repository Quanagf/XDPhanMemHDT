package com.evrental.reporting.dto;

import java.math.BigDecimal;

// Đây là một "Projection Interface" của Spring Data JPA
// Nó tự động map kết quả của câu query vào DTO này
public interface RevenueByStationDTO {
    
    Long getStationId();
    String getStationName();
    Long getTotalBookings();
    BigDecimal getTotalRevenue();
    
}