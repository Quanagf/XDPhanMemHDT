package com.evrental.users.service;

import java.util.List;
import java.util.Optional;

import com.evrental.users.model.Station;

public interface IStationService {
    
    // Lấy tất cả trạm
    List<Station> getAllStations();
    
    // Lấy trạm theo ID
    Optional<Station> getStationById(Long id);
    
    // Tạo trạm mới
    Station createStation(Station station);
    
    // Cập nhật trạm
    Station updateStation(Long id, Station station);
    
    // Xóa trạm (soft delete - đặt isActive = false)
    void deleteStation(Long id);
    
    // Lấy các trạm đang hoạt động
    List<Station> getActiveStations();
    
    // Lấy các trạm theo tỉnh/thành phố
    List<Station> getStationsByProvince(String province);
    
    // Tìm kiếm trạm theo tên
    List<Station> searchStationsByName(String name);
    
    // Lấy danh sách tỉnh/thành phố có trạm
    List<String> getAvailableProvinces();
}
