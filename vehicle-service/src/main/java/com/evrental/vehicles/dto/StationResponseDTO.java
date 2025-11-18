package com.evrental.vehicles.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.evrental.vehicles.model.Station.StationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationResponseDTO {
    private Long id;
    private String name;
    private String address;
    private String phoneNumber;
    private String province;
    private String city;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer capacity;
    private String operatingHours;
    private StationStatus status;
    private Integer vehicleCount; // Số lượng xe khả dụng tại trạm
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
