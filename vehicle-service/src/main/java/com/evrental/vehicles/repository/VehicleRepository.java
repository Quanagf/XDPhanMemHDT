package com.evrental.vehicles.repository;

import com.evrental.vehicles.model.Vehicle;
import com.evrental.vehicles.model.Vehicle.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByStationId(Long stationId);

    List<Vehicle> findByStationIdAndStatus(Long stationId, VehicleStatus status);

    long countByStatus(VehicleStatus status);
    
    long countByStationIdAndStatus(Long stationId, VehicleStatus status);
}