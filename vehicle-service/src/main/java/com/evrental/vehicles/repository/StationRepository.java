package com.evrental.vehicles.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.evrental.vehicles.model.Station;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {
    List<Station> findByStatus(Station.StationStatus status);
}