package com.evrental.vehicles.dto;

import java.time.LocalDate;

import com.evrental.vehicles.model.Vehicle.VehicleStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleWithStationDTO {
    
    private Long id;
    private String licensePlate;
    private String type;
    private Integer batteryLevel;
    private Double pricePerHour;
    private VehicleStatus status;
    private String imageUrl;
    private String description;
    private LocalDate lastMaintenanceDate;
    private Integer seats;
    private Double batteryCapacity;
    private Integer range;
    private String chargingType;
    private String chargingSpeed;
    private String location;
    private Integer tripCount;
    private String technicalCondition;
    private String maintenanceNotes;
    
    // Station info
    private Long stationId;
    private String stationName;
    private String stationAddress;
    private String stationProvince;
    
    public VehicleWithStationDTO(com.evrental.vehicles.model.Vehicle vehicle) {
        this.id = vehicle.getId();
        this.licensePlate = vehicle.getLicensePlate();
        this.type = vehicle.getType();
        this.batteryLevel = vehicle.getBatteryLevel();
        this.pricePerHour = vehicle.getPricePerHour();
        this.status = vehicle.getStatus();
        this.imageUrl = vehicle.getImageUrl();
        this.description = vehicle.getDescription();
        this.lastMaintenanceDate = vehicle.getLastMaintenanceDate();
        this.seats = vehicle.getSeats();
        this.batteryCapacity = vehicle.getBatteryCapacity();
        this.range = vehicle.getRange();
        this.chargingType = vehicle.getChargingType();
        this.chargingSpeed = vehicle.getChargingSpeed();
        this.location = vehicle.getLocation();
        this.tripCount = vehicle.getTripCount();
        this.technicalCondition = vehicle.getTechnicalCondition();
        this.maintenanceNotes = vehicle.getMaintenanceNotes();
        
        // Map station info
        if (vehicle.getStation() != null) {
            this.stationId = vehicle.getStation().getId();
            this.stationName = vehicle.getStation().getName();
            this.stationAddress = vehicle.getStation().getAddress();
            this.stationProvince = vehicle.getStation().getProvince();
        }
    }
}