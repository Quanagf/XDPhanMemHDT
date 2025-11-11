package com.evrental.vehicles.dto; // Hoặc package DTO của bạn

import java.math.BigDecimal;
import com.evrental.vehicles.model.Station.StationStatus;
import lombok.Data;

@Data
public class StationRequestDTO {
    
    private String name;
    private String address;
    private String phoneNumber;
    private String province;
    private String city;
    private Integer capacity = 0;
    private StationStatus status; // Thay isActive bằng status
    
    // Các trường tùy chọn (optional)
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String operatingHours; // Thay openingTime/closingTime bằng string
}