package com.evrental.vehicles.service;

import java.util.List;

import com.evrental.vehicles.dto.CreateVehicleRequest;
import com.evrental.vehicles.dto.UpdateVehicleDetailsRequest;
import com.evrental.vehicles.dto.VehicleStatsDTO;
import com.evrental.vehicles.model.Station;
import com.evrental.vehicles.model.Vehicle;
import com.evrental.vehicles.model.Vehicle.VehicleStatus;

public interface IVehicleService {

    // --- Station Logic ---
    List<Station> getAllStations();

    // --- Vehicle Logic ---
    Vehicle createVehicle(CreateVehicleRequest request);
    List<Vehicle> findVehicles(Long stationId, VehicleStatus status);
    Vehicle getVehicleById(Long vehicleId);
    Vehicle updateVehicleDetails(Long vehicleId, UpdateVehicleDetailsRequest request);
    Vehicle updateVehicleStatus(Long vehicleId, Vehicle.VehicleStatus status);
    void deleteVehicle(Long vehicleId);
    Vehicle updateVehicleImage(Long vehicleId, String imageUrl);
    //chức năng thống kê
    VehicleStatsDTO getVehicleStats();
    
}