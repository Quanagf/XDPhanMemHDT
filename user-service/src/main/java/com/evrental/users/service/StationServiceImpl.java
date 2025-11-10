package com.evrental.users.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.evrental.users.model.Station;
import com.evrental.users.repository.StationRepository;

@Service
@Transactional
public class StationServiceImpl implements IStationService {
    
    @Autowired
    private StationRepository stationRepository;
    
    @Override
    public List<Station> getAllStations() {
        return stationRepository.findAll();
    }
    
    @Override
    public Optional<Station> getStationById(Long id) {
        return stationRepository.findById(id);
    }
    
    @Override
    public Station createStation(Station station) {
        return stationRepository.save(station);
    }
    
    @Override
    public Station updateStation(Long id, Station stationDetails) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found with id: " + id));
        
        station.setName(stationDetails.getName());
        station.setAddress(stationDetails.getAddress());
        station.setPhoneNumber(stationDetails.getPhoneNumber());
        station.setProvince(stationDetails.getProvince());
        station.setCity(stationDetails.getCity());
        station.setLatitude(stationDetails.getLatitude());
        station.setLongitude(stationDetails.getLongitude());
        station.setOpeningTime(stationDetails.getOpeningTime());
        station.setClosingTime(stationDetails.getClosingTime());
        station.setCapacity(stationDetails.getCapacity());
        station.setIsActive(stationDetails.getIsActive());
        
        return stationRepository.save(station);
    }
    
    @Override
    public void deleteStation(Long id) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found with id: " + id));
        
        // Soft delete - chỉ đặt isActive = false
        station.setIsActive(false);
        stationRepository.save(station);
    }
    
    @Override
    public List<Station> getActiveStations() {
        return stationRepository.findByIsActiveTrue();
    }
    
    @Override
    public List<Station> getStationsByProvince(String province) {
        return stationRepository.findByProvinceAndIsActive(province, true);
    }
    
    @Override
    public List<Station> searchStationsByName(String name) {
        return stationRepository.findByNameContainingIgnoreCase(name);
    }
    
    @Override
    public List<String> getAvailableProvinces() {
        return stationRepository.findByIsActiveTrue()
                .stream()
                .map(Station::getProvince)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
}
