package com.evrental.vehicles.dto;

import lombok.Data;

@Data
public class VehicleStatsDTO {
    private long totalVehicles;
    private long available;
    private long rented;
    private long maintenance;
}
