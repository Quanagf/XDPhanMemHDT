package com.evrental.vehicles.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.evrental.vehicles.dto.CreateVehicleRequest;
import com.evrental.vehicles.dto.UpdateVehicleDetailsRequest;
import com.evrental.vehicles.dto.VehicleStatsDTO;
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

        // Kiểm tra biển số đã tồn tại
        if (vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Biển số xe '" + request.getLicensePlate() + "' đã tồn tại trong hệ thống");
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setType(request.getType());
        vehicle.setBatteryLevel(request.getBatteryLevel());
        vehicle.setPricePerHour(request.getPricePerHour());
        vehicle.setStatus(request.getStatus() != null ? request.getStatus() : VehicleStatus.AVAILABLE);
        
        // Gán các trường cơ bản
        vehicle.setImageUrl(request.getImageUrl());
        vehicle.setDescription(request.getDescription());
        vehicle.setLastMaintenanceDate(request.getLastMaintenanceDate());
        
        // Gán các trường thông số kỹ thuật
        vehicle.setSeats(request.getSeats());
        vehicle.setBatteryCapacity(request.getBatteryCapacity());
        vehicle.setRange(request.getRange());
        vehicle.setChargingType(request.getChargingType());
        vehicle.setChargingSpeed(request.getChargingSpeed());
        vehicle.setLocation(request.getLocation());
        vehicle.setTripCount(request.getTripCount());
        
        // Gán các trường bảo trì và kỹ thuật
        vehicle.setTechnicalCondition(request.getTechnicalCondition());
        vehicle.setMaintenanceNotes(request.getMaintenanceNotes());
        
        vehicle.setStation(station);

        try {
            return vehicleRepository.save(vehicle);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            String message = e.getMessage();
            if (message != null && (message.contains("Duplicate entry") || message.contains("duplicate"))) {
                if (message.contains("license_plate") || message.contains("UK9vovnbiegxevdhqfcwvp2g8pj")) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                        "Biển số xe '" + request.getLicensePlate() + "' đã tồn tại trong hệ thống");
                }
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Thông tin xe đã tồn tại trong hệ thống");
            }
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Lỗi dữ liệu: " + e.getMostSpecificCause().getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Lỗi khi tạo xe: " + e.getMessage());
        }
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
    public Page<Vehicle> findVehicles(Long stationId, VehicleStatus status, Pageable pageable) {
        // Tạo Specification động
        Specification<Vehicle> spec = (root, query, builder) -> builder.conjunction();
        
        if (stationId != null) {
            spec = spec.and((root, query, builder) -> 
                builder.equal(root.get("station").get("id"), stationId));
        }
        
        if (status != null) {
            spec = spec.and((root, query, builder) -> 
                builder.equal(root.get("status"), status));
        }
        
        return vehicleRepository.findAll(spec, pageable);
    }

    @Override
    public List<Vehicle> findVehiclesList(Long stationId, VehicleStatus status) {
        // Sử dụng lại logic của method cũ
        return findVehicles(stationId, status);
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
        
        // Cập nhật thông số kỹ thuật nếu được cung cấp
        if (request.getSeats() != null) {
            vehicle.setSeats(request.getSeats());
        }
        if (request.getBatteryCapacity() != null) {
            vehicle.setBatteryCapacity(request.getBatteryCapacity());
        }
        if (request.getRange() != null) {
            vehicle.setRange(request.getRange());
        }
        if (request.getChargingType() != null) {
            vehicle.setChargingType(request.getChargingType());
        }
        if (request.getChargingSpeed() != null) {
            vehicle.setChargingSpeed(request.getChargingSpeed());
        }
        if (request.getLocation() != null) {
            vehicle.setLocation(request.getLocation());
        }
        if (request.getTripCount() != null) {
            vehicle.setTripCount(request.getTripCount());
        }
        
        // Cập nhật trạng thái kỹ thuật nếu được cung cấp
        if (request.getTechnicalCondition() != null && !request.getTechnicalCondition().isBlank()) {
            vehicle.setTechnicalCondition(request.getTechnicalCondition());
        }
        
        // Cập nhật ghi chú bảo trì nếu được cung cấp
        if (request.getMaintenanceNotes() != null) {
            vehicle.setMaintenanceNotes(request.getMaintenanceNotes());
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