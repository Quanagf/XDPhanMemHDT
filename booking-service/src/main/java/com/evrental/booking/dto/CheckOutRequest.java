package com.evrental.booking.dto;

import lombok.Data;

@Data
public class CheckOutRequest {
    private Long endStationId;
    private String checkoutVehicleImageUrl; // Ảnh xe lúc nhận xe
    private String vehicleConditionNotes;   // Ghi chú tình trạng xe
    private java.time.LocalDateTime actualEndTime; // Thời gian thực tế nhận xe
}