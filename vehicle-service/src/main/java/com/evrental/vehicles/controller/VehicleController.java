package com.evrental.vehicles.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.evrental.vehicles.dto.CreateVehicleRequest;
import com.evrental.vehicles.dto.UpdateVehicleDetailsRequest;
import com.evrental.vehicles.dto.VehicleStatsDTO;
import com.evrental.vehicles.dto.VehicleWithStationDTO;
import com.evrental.vehicles.model.Vehicle;
import com.evrental.vehicles.model.Vehicle.VehicleStatus;
import com.evrental.vehicles.service.IVehicleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/vehicles") // Tiền tố cho API Xe
@RequiredArgsConstructor
public class VehicleController {

    private final IVehicleService vehicleService;
    private final com.evrental.vehicles.service.IFileStorageService fileStorageService;

    @GetMapping("/ping")
    public String ping() {
        return "Vehicle-Service (Vehicles) is alive!";
    }

    // API cho Admin: Thêm xe mới (3.a)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vehicle> createVehicle(@Valid @RequestBody CreateVehicleRequest request) {
        Vehicle newVehicle = vehicleService.createVehicle(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(newVehicle);
    }

    // API cho Renter/Staff: Lấy danh sách xe với phân trang (1.b / 2.a)
    @GetMapping
    public ResponseEntity<Page<Vehicle>> findVehicles(
            @RequestParam(required = false) Long stationId,
            @RequestParam(required = false) VehicleStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        Sort sort = sortDirection.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Vehicle> vehicles = vehicleService.findVehicles(stationId, status, pageable);
        return ResponseEntity.ok(vehicles);
    }

    // API cho danh sách đơn giản không phân trang (backward compatibility)
    @GetMapping("/list")
    public ResponseEntity<List<Vehicle>> findVehiclesList(
            @RequestParam(required = false) Long stationId,
            @RequestParam(required = false) VehicleStatus status) {
        
        List<Vehicle> vehicles = vehicleService.findVehiclesList(stationId, status);
        return ResponseEntity.ok(vehicles);
    }
    
    // API Lấy 1 xe (dùng cho booking-service sau này)
    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Long id) {
        Vehicle vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(vehicle);
    }

    // API Lấy 1 xe với thông tin trạm (dùng cho frontend)
    @GetMapping("/{id}/with-station")
    public ResponseEntity<VehicleWithStationDTO> getVehicleWithStation(@PathVariable Long id) {
        Vehicle vehicle = vehicleService.getVehicleById(id);
        VehicleWithStationDTO vehicleWithStation = new VehicleWithStationDTO(vehicle);
        return ResponseEntity.ok(vehicleWithStation);
    }

    // API cho Staff/Admin: Cập nhật pin/trạng thái (2.d)
    @PutMapping("/{id}/details")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<Vehicle> updateVehicleDetails(
            @PathVariable("id") Long vehicleId,
            @Valid @RequestBody UpdateVehicleDetailsRequest request) {
        
        Vehicle updatedVehicle = vehicleService.updateVehicleDetails(vehicleId, request);
        return ResponseEntity.ok(updatedVehicle);
    }

    // API NỘI BỘ (cho booking-service gọi)
    // Cập nhật trạng thái xe (Đặt / Trả)
    @PutMapping("/{id}/status/{statusName}")
    // @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')") // TẠM BỎ ĐỂ CHO BOOKING-SERVICE GỌI
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

    // Xóa xe (Admin)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

    // Thống kê đội xe
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VehicleStatsDTO> getStats() {
        VehicleStatsDTO stats = vehicleService.getVehicleStats();
        return ResponseEntity.ok(stats);
    }

    // Upload image for vehicle (Staff/Admin)
    @PostMapping("/{id}/image")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<Vehicle> uploadVehicleImage(@PathVariable Long id, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        String objectName = "vehicles/" + id + "/" + System.currentTimeMillis() + "-" + file.getOriginalFilename();
        String url = fileStorageService.uploadFile(file, objectName);
        Vehicle updated = vehicleService.updateVehicleImage(id, url);
        return ResponseEntity.ok(updated);
    }
}
