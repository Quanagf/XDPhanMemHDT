package com.evrental.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.evrental.booking.model.Booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDTO {
    
    // Booking info
    private Long id;
    private Long userId;
    private Long vehicleId;
    private Long startStationId;
    private Long endStationId;
    private LocalDateTime bookingTime;
    private LocalDateTime estimatedStartTime;
    private LocalDateTime estimatedEndTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private String checkoutVehicleImageUrl;
    private String checkinVehicleImageUrl; // Ảnh xe lúc giao
    private String customerLicenseImageUrl; // Ảnh bằng lái khách hàng
    private Boolean staffVerifiedCustomer; // Nhân viên đã xác thực
    private Booking.BookingStatus status;
    private BigDecimal totalCost;
    private Booking.BookingType bookingType; // Loại đặt xe
    
    // User info (optional - được fetch từ user-service nếu cần)
    private UserInfo userInfo;
    
    // Vehicle info (optional - được fetch từ vehicle-service nếu cần)
    private VehicleInfo vehicleInfo;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String fullName;
        private String email;
        private String phoneNumber;
        private String username;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VehicleInfo {
        private Long id;
        private String type;
        private String licensePlate;
        private String description;
        private String imageUrl;
        private Integer batteryLevel;
        private Integer seats;
        private BigDecimal pricePerHour;
        private String status;
    }
    
    // Static method để convert từ Booking entity sang DTO
    public static BookingResponseDTO fromBooking(Booking booking) {
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .vehicleId(booking.getVehicleId())
                .startStationId(booking.getStartStationId())
                .endStationId(booking.getEndStationId())
                .bookingTime(booking.getBookingTime())
                .estimatedStartTime(booking.getEstimatedStartTime())
                .estimatedEndTime(booking.getEstimatedEndTime())
                .actualStartTime(booking.getActualStartTime())
                .actualEndTime(booking.getActualEndTime())
                .checkoutVehicleImageUrl(booking.getCheckoutVehicleImageUrl())
                .checkinVehicleImageUrl(booking.getCheckinVehicleImageUrl())
                .customerLicenseImageUrl(booking.getCustomerLicenseImageUrl())
                .staffVerifiedCustomer(booking.getStaffVerifiedCustomer())
                .status(booking.getStatus())
                .totalCost(booking.getTotalCost())
                .bookingType(booking.getBookingType())
                .build();
    }
}