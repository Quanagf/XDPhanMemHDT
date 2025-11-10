package com.evrental.users.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.evrental.users.model.Station;
import com.evrental.users.service.IStationService;

@RestController
@RequestMapping("/api/stations")
@CrossOrigin(origins = "*")
public class StationController {
    
    @Autowired
    private IStationService stationService;
    
    /**
     * Lấy tất cả trạm (Public - cho trang liên hệ)
     */
    @GetMapping
    public ResponseEntity<List<Station>> getAllStations() {
        List<Station> stations = stationService.getAllStations();
        return ResponseEntity.ok(stations);
    }
    
    /**
     * Lấy các trạm đang hoạt động (Public)
     */
    @GetMapping("/active")
    public ResponseEntity<List<Station>> getActiveStations() {
        List<Station> stations = stationService.getActiveStations();
        return ResponseEntity.ok(stations);
    }
    
    /**
     * Lấy trạm theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Station> getStationById(@PathVariable Long id) {
        return stationService.getStationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Lấy các trạm theo tỉnh/thành phố (Public)
     */
    @GetMapping("/province/{province}")
    public ResponseEntity<List<Station>> getStationsByProvince(@PathVariable String province) {
        List<Station> stations = stationService.getStationsByProvince(province);
        return ResponseEntity.ok(stations);
    }
    
    /**
     * Lấy danh sách các tỉnh/thành phố có trạm (Public)
     */
    @GetMapping("/provinces")
    public ResponseEntity<List<String>> getAvailableProvinces() {
        List<String> provinces = stationService.getAvailableProvinces();
        return ResponseEntity.ok(provinces);
    }
    
    /**
     * Tìm kiếm trạm theo tên
     */
    @GetMapping("/search")
    public ResponseEntity<List<Station>> searchStations(@RequestParam String name) {
        List<Station> stations = stationService.searchStationsByName(name);
        return ResponseEntity.ok(stations);
    }
    
    /**
     * Tạo trạm mới (Chỉ ADMIN)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createStation(@RequestBody Station station) {
        try {
            Station createdStation = stationService.createStation(station);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdStation);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể tạo trạm: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Cập nhật trạm (Chỉ ADMIN)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStation(@PathVariable Long id, @RequestBody Station station) {
        try {
            Station updatedStation = stationService.updateStation(id, station);
            return ResponseEntity.ok(updatedStation);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể cập nhật trạm: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Xóa trạm (Soft delete - Chỉ ADMIN)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteStation(@PathVariable Long id) {
        try {
            stationService.deleteStation(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Đã vô hiệu hóa trạm thành công");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}
