package com.evrental.booking.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import com.evrental.booking.dto.BookingResponseDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class ExternalApiService {
    
    private final RestTemplate restTemplate;
    
    @Value("${service.url.users}")
    private String userServiceUrl;
    
    @Value("${service.url.vehicles}")
    private String vehicleServiceUrl;
    
    public BookingResponseDTO.UserInfo getUserInfo(Long userId) {
        try {
            String url = userServiceUrl + "/api/users/" + userId;
            log.debug("Calling user service: {}", url);
            
            // Assuming user service returns user info in a specific format
            // You may need to adjust this based on actual user service API
            UserServiceResponse response = restTemplate.getForObject(url, UserServiceResponse.class);
            
            if (response != null) {
                return BookingResponseDTO.UserInfo.builder()
                        .id(response.getId())
                        .fullName(response.getFullName())
                        .email(response.getEmail())
                        .phoneNumber(response.getPhoneNumber())
                        .username(response.getUsername())
                        .licenseNumber(response.getLicenseNumber())
                        .identityNumber(response.getIdentityNumber())
                        .licenseImage(response.getLicenseImage())
                        .identityImage(response.getIdentityImage())
                        .build();
            }
            
        } catch (RestClientException e) {
            log.error("Error calling user service for userId {}: {}", userId, e.getMessage());
        }
        
        return null;
    }
    
    public BookingResponseDTO.VehicleInfo getVehicleInfo(Long vehicleId) {
        try {
            String url = vehicleServiceUrl + "/api/vehicles/" + vehicleId;
            log.debug("Calling vehicle service: {}", url);
            
            // Assuming vehicle service returns vehicle info in a specific format
            VehicleServiceResponse response = restTemplate.getForObject(url, VehicleServiceResponse.class);
            
            if (response != null) {
                // Convert Double to BigDecimal for pricePerHour
                java.math.BigDecimal pricePerHour = response.getPricePerHour() != null 
                    ? java.math.BigDecimal.valueOf(response.getPricePerHour()) 
                    : null;
                
                return BookingResponseDTO.VehicleInfo.builder()
                        .id(response.getId())
                        .type(response.getType())
                        .licensePlate(response.getLicensePlate())
                        .description(response.getDescription())
                        .imageUrl(response.getImageUrl())
                        .batteryLevel(response.getBatteryLevel())
                        .seats(response.getSeats())
                        .pricePerHour(pricePerHour)
                        .status(response.getStatus())
                        .build();
            }
            
        } catch (RestClientException e) {
            log.error("Error calling vehicle service for vehicleId {}: {}", vehicleId, e.getMessage());
        }
        
        return null;
    }
    
    // Inner classes for external API responses
    private static class UserServiceResponse {
        private Long id;
        private String fullName;
        private String email;
        private String phoneNumber;
        private String username;
        private String licenseNumber;   // GPLX
        private String identityNumber;  // CCCD
        private String licenseImage;    // URL ảnh GPLX
        private String identityImage;   // URL ảnh CCCD
        
        // getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getLicenseNumber() { return licenseNumber; }
        public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
        public String getIdentityNumber() { return identityNumber; }
        public void setIdentityNumber(String identityNumber) { this.identityNumber = identityNumber; }
        public String getLicenseImage() { return licenseImage; }
        public void setLicenseImage(String licenseImage) { this.licenseImage = licenseImage; }
        public String getIdentityImage() { return identityImage; }
        public void setIdentityImage(String identityImage) { this.identityImage = identityImage; }
    }
    
    public static class VehicleServiceResponse {
        private Long id;
        private String type;
        private String licensePlate;
        private String description;
        private String imageUrl;
        private Integer batteryLevel;
        private Integer seats;
        private Double pricePerHour; // Đổi từ BigDecimal sang Double để match với Vehicle entity
        private String status;
        
        // getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getLicensePlate() { return licensePlate; }
        public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public Integer getBatteryLevel() { return batteryLevel; }
        public void setBatteryLevel(Integer batteryLevel) { this.batteryLevel = batteryLevel; }
        public Integer getSeats() { return seats; }
        public void setSeats(Integer seats) { this.seats = seats; }
        public Double getPricePerHour() { return pricePerHour; }
        public void setPricePerHour(Double pricePerHour) { this.pricePerHour = pricePerHour; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}