package com.evrental.vehicles.service;

import com.evrental.vehicles.dto.CreateVehicleRequest;
import com.evrental.vehicles.dto.UpdateVehicleDetailsRequest;
import com.evrental.vehicles.model.Station;
import com.evrental.vehicles.model.Vehicle;
import com.evrental.vehicles.model.Vehicle.VehicleStatus;
import com.evrental.vehicles.repository.StationRepository;
import com.evrental.vehicles.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import com.evrental.vehicles.dto.VehicleStatsDTO;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements IVehicleService {

    private final StationRepository stationRepository;
    private final VehicleRepository vehicleRepository;

    // --- Station Logic --
    @Override
    public List<Station> getAllStations() {
        return stationRepository.findAll();
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

        // Cập nhật biển số nếu được cung cấp
        if (request.getLicensePlate() != null && !request.getLicensePlate().isBlank()) {
            vehicle.setLicensePlate(request.getLicensePlate());
        }
        
        // Cập nhật loại xe nếu được cung cấp
        if (request.getType() != null && !request.getType().isBlank()) {
            vehicle.setType(request.getType());
        }
        
        // Cập nhật giá nếu được cung cấp
        if (request.getPricePerHour() != null) {
            vehicle.setPricePerHour(request.getPricePerHour());
        }
        
        // Cập nhật pin nếu được cung cấp
        if (request.getBatteryLevel() != null) {
            vehicle.setBatteryLevel(request.getBatteryLevel());
        }
        
        // Cập nhật trạng thái nếu được cung cấp
        if (request.getStatus() != null) {
            vehicle.setStatus(request.getStatus());
        }
        
        // Cập nhật mô tả nếu được cung cấp
        if (request.getDescription() != null) {
            vehicle.setDescription(request.getDescription());
        }
        
        // Cập nhật ngày bảo trì nếu được cung cấp
        if (request.getLastMaintenanceDate() != null) {
            vehicle.setLastMaintenanceDate(request.getLastMaintenanceDate());
        }
        
        // Cập nhật trạm nếu được cung cấp
        if (request.getStationId() != null) {
            Station station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> new RuntimeException("Station not found"));
            vehicle.setStation(station);
        }

        return vehicleRepository.save(vehicle);
    }

    @Override
    public Vehicle updateVehicleStatus(Long vehicleId, Vehicle.VehicleStatus status) {
        Vehicle vehicle = getVehicleById(vehicleId);
        vehicle.setStatus(status);
        return vehicleRepository.save(vehicle);
    }

    @Override
    public void deleteVehicle(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
        vehicleRepository.delete(vehicle);
    }

    @Override
    public VehicleStatsDTO getVehicleStats() {
        VehicleStatsDTO stats = new VehicleStatsDTO();
        long total = vehicleRepository.count();
        long available = vehicleRepository.countByStatus(VehicleStatus.AVAILABLE);
        long rented = vehicleRepository.countByStatus(VehicleStatus.RENTED);
        long maintenance = vehicleRepository.countByStatus(VehicleStatus.MAINTENANCE);

        stats.setTotalVehicles(total);
        stats.setAvailable(available);
        stats.setRented(rented);
        stats.setMaintenance(maintenance);

        return stats;
    }

    @Override
    public Vehicle updateVehicleImage(Long vehicleId, String imageUrl) {
        Vehicle vehicle = getVehicleById(vehicleId);
        vehicle.setImageUrl(imageUrl);
        return vehicleRepository.save(vehicle);
    }
}