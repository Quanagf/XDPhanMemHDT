package com.evrental.vehicles.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.evrental.vehicles.dto.CreateVehicleRequest;
import com.evrental.vehicles.dto.UpdateVehicleDetailsRequest;
import com.evrental.vehicles.model.Station;
import com.evrental.vehicles.model.Vehicle;
import com.evrental.vehicles.model.Vehicle.VehicleStatus;
import com.evrental.vehicles.repository.StationRepository;
import com.evrental.vehicles.repository.VehicleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements IVehicleService {

    private final StationRepository stationRepository;
    private final VehicleRepository vehicleRepository;

    // --- Station Logic ---

    @Override
    public Station createStation(Station station) {
        // Gán trạng thái mặc định nếu chưa có
        if (station.getStatus() == null) {
            station.setStatus(Station.StationStatus.OPEN);
        }
        return stationRepository.save(station);
    }

    @Override
    public List<Station> getAllStations() {
        return stationRepository.findAll();
    }

    @Override
    public List<Station> getActiveStations() {
        return stationRepository.findByStatus(Station.StationStatus.OPEN);
    }

    @Override
    public Station getStationById(Long id) {
        return stationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Station not found"));
    }

    @Override
    public Station updateStation(Long id, Station stationDetails) {
        Station station = getStationById(id);
        
        station.setName(stationDetails.getName());
        station.setAddress(stationDetails.getAddress());
        station.setPhoneNumber(stationDetails.getPhoneNumber());
        station.setProvince(stationDetails.getProvince());
        station.setCity(stationDetails.getCity());
        station.setCapacity(stationDetails.getCapacity());
        station.setStatus(stationDetails.getStatus());
        
        return stationRepository.save(station);
    }

    @Override
    public void deleteStation(Long id) {
        Station station = getStationById(id);
        station.setStatus(Station.StationStatus.CLOSED);
        stationRepository.save(station);
    }

    // --- Vehicle Logic ---

    @Override
    public Vehicle createVehicle(CreateVehicleRequest request) {
        Station station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Station not found"));

        Vehicle vehicle = new Vehicle();
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setType(request.getType());
        vehicle.setBatteryLevel(request.getBatteryLevel());
        vehicle.setPricePerHour(request.getPricePerHour());
        vehicle.setStatus(request.getStatus() != null ? request.getStatus() : VehicleStatus.AVAILABLE);
        
        // Gán các trường mới
        vehicle.setImageUrl(request.getImageUrl());
        vehicle.setDescription(request.getDescription());
        vehicle.setLastMaintenanceDate(request.getLastMaintenanceDate());
        
        vehicle.setStation(station);

        return vehicleRepository.save(vehicle);
    }

    @Override
    public List<Vehicle> findVehicles(Long stationId, VehicleStatus status) {
        if (stationId != null && status != null) {
            return vehicleRepository.findByStationIdAndStatus(stationId, status);
        } else if (stationId != null) {
            return vehicleRepository.findByStationId(stationId);
        } else {
            return vehicleRepository.findAll();
        }
    }

    @Override
    public Vehicle getVehicleById(Long vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
    }

    @Override
    public Vehicle updateVehicleDetails(Long vehicleId, UpdateVehicleDetailsRequest request) {
        Vehicle vehicle = getVehicleById(vehicleId);

        // Cập nhật các trường nếu chúng được cung cấp
        if (request.getBatteryLevel() != null) {
            vehicle.setBatteryLevel(request.getBatteryLevel());
        }
        if (request.getStatus() != null) {
            vehicle.setStatus(request.getStatus());
        }
        if (request.getDescription() != null) {
            vehicle.setDescription(request.getDescription());
        }
        if (request.getLastMaintenanceDate() != null) {
            vehicle.setLastMaintenanceDate(request.getLastMaintenanceDate());
        }

        return vehicleRepository.save(vehicle);
    }

    @Override
    public Vehicle updateVehicleStatus(Long vehicleId, Vehicle.VehicleStatus status) {
        Vehicle vehicle = getVehicleById(vehicleId);
        vehicle.setStatus(status);
        return vehicleRepository.save(vehicle);
    }
}