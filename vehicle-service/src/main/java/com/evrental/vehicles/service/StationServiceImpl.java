package com.evrental.vehicles.service;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.evrental.vehicles.dto.StationStatsDTO;
import com.evrental.vehicles.model.Station;
import com.evrental.vehicles.repository.StationRepository;

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
        station.setOperatingHours(stationDetails.getOperatingHours());
        station.setCapacity(stationDetails.getCapacity());
        station.setStatus(stationDetails.getStatus());
        
        return stationRepository.save(station);
    }
    
    @Override
    public void deleteStation(Long id) {
        // Kiểm tra trạm có tồn tại không
        if (!stationRepository.existsById(id)) {
            throw new RuntimeException("Station not found with id: " + id);
        }
        
        // Hard delete - xóa hoàn toàn khỏi database
        stationRepository.deleteById(id);
    }
    
    @Override
    public List<Station> getActiveStations() {
        return stationRepository.findByStatus(Station.StationStatus.OPEN);
    }
    
    @Override
    public List<Station> getStationsByProvince(String province) {
        return stationRepository.findByProvinceAndStatus(province, Station.StationStatus.OPEN);
    }
    
    @Override
    public List<Station> searchStationsByName(String name) {
        return stationRepository.findByNameContainingIgnoreCase(name);
    }
    
    @Override
    public List<String> getAvailableProvinces() {
        return stationRepository.findByStatus(Station.StationStatus.OPEN)
                .stream()
                .map(Station::getProvince)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả dữ liệu thống kê cho các trạm.
     */
    @Override
    public StationStatsDTO getStationStatistics() {
        
        // 1. Lấy tổng số trạm
        long totalStations = stationRepository.count();
        
        // 2. Lấy số trạm đang hoạt động (OPEN)
        long activeStations = stationRepository.countByStatus(Station.StationStatus.OPEN);
        
        // 3. Số trạm không hoạt động (CLOSED hoặc TEMPORARILY_UNAVAILABLE)
        long inactiveStations = totalStations - activeStations;
        
        // 4. Lấy tổng sức chứa
        Long capacityResult = stationRepository.getTotalCapacity();
        // Xử lý trường hợp DB rỗng (trả về null), gán là 0
        long totalCapacity = (capacityResult == null) ? 0L : capacityResult;

        // 5. Lấy thống kê theo tỉnh
        List<Object[]> provinceCounts = stationRepository.countStationsByProvince();
        
        // Chuyển List<Object[]> thành Map<String, Long> cho dễ đọc
        Map<String, Long> stationsByProvince = provinceCounts.stream()
                .collect(Collectors.toMap(
                        arr -> (String) arr[0], // Key: Tên tỉnh
                        arr -> (Long) arr[1]    // Value: Số lượng
                ));

        // 6. Xây dựng DTO trả về
        return StationStatsDTO.builder()
                .totalStations(totalStations)
                .activeStations(activeStations)
                .inactiveStations(inactiveStations)
                .totalCapacity(totalCapacity)
                .stationsByProvince(stationsByProvince)
                .build();
    }

    
}
