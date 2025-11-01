package com.evrental.vehicles.service;

import com.evrental.vehicles.dto.CreateVehicleRequest;
import com.evrental.vehicles.dto.UpdateVehicleDetailsRequest;
import com.evrental.vehicles.model.Station;
import com.evrental.vehicles.model.Vehicle;
import com.evrental.vehicles.model.Vehicle.VehicleStatus;

import java.util.List;

public interface IVehicleService {

    // --- Station Logic ---
    Station createStation(Station station);
    List<Station> getAllStations();

    // --- Vehicle Logic ---
    Vehicle createVehicle(CreateVehicleRequest request);
    List<Vehicle> findVehicles(Long stationId, VehicleStatus status);
    Vehicle getVehicleById(Long vehicleId);
    Vehicle updateVehicleDetails(Long vehicleId, UpdateVehicleDetailsRequest request);
    Vehicle updateVehicleStatus(Long vehicleId, Vehicle.VehicleStatus status);
}