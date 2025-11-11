package com.evrental.vehicles.dto; // Hoặc package DTO của bạn

import java.math.BigDecimal;
import java.time.LocalTime;
import lombok.Data;

@Data
public class StationRequestDTO {
    
    private String name;
    private String address;
    private String phoneNumber;
    private String province;
    private Integer capacity = 0;
    private Boolean isActive = true;
    
    // Các trường tùy chọn (optional)
    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalTime openingTime;
    private LocalTime closingTime;
}