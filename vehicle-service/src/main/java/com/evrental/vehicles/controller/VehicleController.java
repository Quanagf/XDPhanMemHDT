package com.evrental.vehicles.controller;

import com.evrental.vehicles.dto.CreateVehicleRequest;
import com.evrental.vehicles.dto.UpdateVehicleDetailsRequest;
import com.evrental.vehicles.model.Vehicle;
import com.evrental.vehicles.model.Vehicle.VehicleStatus;
import com.evrental.vehicles.service.IVehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles") // Tiền tố cho API Xe
@RequiredArgsConstructor
public class VehicleController {

    private final IVehicleService vehicleService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/ping")
    public String ping() {
        return "Vehicle-Service (Vehicles) is alive!";
    }

    // API cho Admin: Thêm xe mới (3.a)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vehicle> createVehicle(@RequestBody CreateVehicleRequest request) {
        Vehicle newVehicle = vehicleService.createVehicle(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(newVehicle);
    }

    // API cho Renter/Staff: Lấy danh sách xe (1.b / 2.a)
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Vehicle>> findVehicles(
            @RequestParam(required = false) Long stationId,
            @RequestParam(required = false) VehicleStatus status) {
        
        List<Vehicle> vehicles = vehicleService.findVehicles(stationId, status);
        return ResponseEntity.ok(vehicles);
    }
    
    // API Lấy 1 xe (dùng cho booking-service sau này)
    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Long id) {
        Vehicle vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(vehicle);
    }

    // API cho Staff/Admin: Cập nhật pin/trạng thái (2.d)
    @PutMapping("/{id}/details")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<Vehicle> updateVehicleDetails(
            @PathVariable("id") Long vehicleId,
            @RequestBody UpdateVehicleDetailsRequest request) {
        
        Vehicle updatedVehicle = vehicleService.updateVehicleDetails(vehicleId, request);
        return ResponseEntity.ok(updatedVehicle);
    }

    // API NỘI BỘ (cho booking-service gọi)
    // Cập nhật trạng thái xe (Đặt / Trả)
    @PutMapping("/{id}/status/{statusName}")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<Vehicle> updateVehicleStatus(
            @PathVariable Long id,
            @PathVariable String statusName) {
                
        try {
            Vehicle.VehicleStatus status = Vehicle.VehicleStatus.valueOf(statusName.toUpperCase());
            Vehicle updatedVehicle = vehicleService.updateVehicleStatus(id, status);
            return ResponseEntity.ok(updatedVehicle);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build(); // Nếu gửi statusName bậy (vd: "abc")
        }
    }
}