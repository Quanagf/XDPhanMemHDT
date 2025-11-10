package com.evrental.vehicles.controller;

import java.util.List;

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
import org.springframework.web.bind.annotation.RestController;

import com.evrental.vehicles.model.Station;
import com.evrental.vehicles.service.IVehicleService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stations")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class StationController {

    private final IVehicleService vehicleService;

    /**
     * Lấy tất cả trạm (Public - cho trang liên hệ)
     */
    @GetMapping
    public ResponseEntity<List<Station>> getAllStations() {
        List<Station> stations = vehicleService.getAllStations();
        return ResponseEntity.ok(stations);
    }

    /**
     * Lấy các trạm đang hoạt động (Public)
     */
    @GetMapping("/active")
    public ResponseEntity<List<Station>> getActiveStations() {
        List<Station> stations = vehicleService.getActiveStations();
        return ResponseEntity.ok(stations);
    }

    /**
     * Lấy trạm theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Station> getStationById(@PathVariable Long id) {
        Station station = vehicleService.getStationById(id);
        return ResponseEntity.ok(station);
    }

    /**
     * Tạo trạm mới (Chỉ Admin)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Station> createStation(@RequestBody Station station) {
        Station newStation = vehicleService.createStation(station);
        return ResponseEntity.status(HttpStatus.CREATED).body(newStation);
    }

    /**
     * Cập nhật trạm (Chỉ Admin)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Station> updateStation(@PathVariable Long id, @RequestBody Station stationDetails) {
        Station updatedStation = vehicleService.updateStation(id, stationDetails);
        return ResponseEntity.ok(updatedStation);
    }

    /**
     * Xóa/Vô hiệu hóa trạm (Chỉ Admin)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStation(@PathVariable Long id) {
        vehicleService.deleteStation(id);
        return ResponseEntity.noContent().build();
    }
}