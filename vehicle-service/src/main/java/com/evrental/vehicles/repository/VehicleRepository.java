package com.evrental.vehicles.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.evrental.vehicles.model.Vehicle;
import com.evrental.vehicles.model.Vehicle.VehicleStatus;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long>, JpaSpecificationExecutor<Vehicle> {

    List<Vehicle> findByStationId(Long stationId);

    List<Vehicle> findByStationIdAndStatus(Long stationId, VehicleStatus status);

    long countByStatus(VehicleStatus status);
    
    long countByStationIdAndStatus(Long stationId, VehicleStatus status);

    boolean existsByLicensePlate(String licensePlate);
}