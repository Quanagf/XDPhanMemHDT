package com.evrental.vehicles.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
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
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;

import com.evrental.vehicles.dto.DeleteStationRequest;
import com.evrental.vehicles.dto.StationStatsDTO;
import com.evrental.vehicles.model.Station;
import com.evrental.vehicles.service.IStationService;

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
     * Xóa trạm (Hard delete - Chỉ ADMIN)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteStation(@PathVariable Long id) {
        try {
            stationService.deleteStation(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Đã xóa trạm thành công");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Xóa trạm với xác nhận mật khẩu admin (Hard delete - Chỉ ADMIN)
     */
    @PostMapping("/{id}/delete-with-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteStationWithPassword(
            @PathVariable Long id, 
            @RequestBody DeleteStationRequest request,
            HttpServletRequest httpRequest) {
        try {
            // Gọi user-service để xác thực mật khẩu admin
            boolean isValidPassword = verifyAdminPassword(request.getAdminPassword(), httpRequest);
            
            if (!isValidPassword) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Mật khẩu admin không đúng");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            // Nếu mật khẩu đúng, thực hiện xóa trạm
            stationService.deleteStation(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Đã xóa trạm thành công");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Có lỗi xảy ra khi xóa trạm: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Xác thực mật khẩu admin bằng cách gọi user-service
     */
    private boolean verifyAdminPassword(String password, HttpServletRequest httpRequest) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            // Thử cả hai URL: docker internal và localhost
            String[] userServiceUrls = {
                "http://user-service:8080/api/users/verify-password",  // Docker internal
                "http://localhost:8081/api/users/verify-password"      // Localhost fallback
            };
            
            // Tạo request body
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("password", password);
            
            // Lấy Authorization header từ request
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.err.println("Missing or invalid Authorization header");
                return false;
            }
            
            // Tạo headers với Authorization
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("Authorization", authHeader);
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);
            
            // Thử từng URL
            for (String userServiceUrl : userServiceUrls) {
                try {
                    System.out.println("Trying URL: " + userServiceUrl);
                    
                    ResponseEntity<String> response = restTemplate.postForEntity(
                        userServiceUrl, 
                        entity, 
                        String.class
                    );
                    
                    System.out.println("Response status: " + response.getStatusCode());
                    System.out.println("Response body: " + response.getBody());
                    
                    if (response.getStatusCode() == HttpStatus.OK) {
                        String responseBody = response.getBody();
                        boolean isValid = responseBody != null && 
                                         (responseBody.contains("\"valid\":true") || responseBody.contains("\"valid\": true"));
                        System.out.println("Password validation result: " + isValid);
                        return isValid;
                    }
                } catch (Exception e) {
                    System.err.println("Failed with URL " + userServiceUrl + ": " + e.getMessage());
                    // Continue to next URL
                }
            }
            
            return false;
            
        } catch (Exception e) {
            System.err.println("Error verifying admin password: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Endpoint mới cho chức năng thống kê trạm.
     * React sẽ gọi GET /api/stations/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<StationStatsDTO> getStationStatistics() {
        StationStatsDTO stats = stationService.getStationStatistics();
        return ResponseEntity.ok(stats);
    }
}
