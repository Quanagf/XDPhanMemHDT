package com.evrental.vehicles.controller;

import com.evrental.vehicles.model.Station;
import com.evrental.vehicles.service.IVehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations") // Tiền tố cho API Trạm
@RequiredArgsConstructor
public class StationController {

    private final IVehicleService vehicleService;

    @GetMapping("/ping")
    public String ping() {
        return "Vehicle-Service (Stations) is alive!";
    }

    // API cho Admin: Tạo điểm thuê mới (3.a)
    @PostMapping
    // TODO: Thêm bảo mật @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Station> createStation(@RequestBody Station station) {
        // Vì request body là nguyên 1 object Station, 
        // các trường mới (operatingHours, capacity...) sẽ tự động được gán
        Station newStation = vehicleService.createStation(station);
        return ResponseEntity.status(HttpStatus.CREATED).body(newStation);
    }

    // API cho Renter: Lấy tất cả điểm thuê (cho bản đồ 1.b)
    @GetMapping
    // TODO: Thêm bảo mật @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Station>> getAllStations() {
        List<Station> stations = vehicleService.getAllStations();
        return ResponseEntity.ok(stations);
    }
}