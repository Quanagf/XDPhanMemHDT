package com.evrental.booking.dto;

import lombok.Data;

@Data
public class CheckOutRequest {
    private Long endStationId;
    private String checkoutVehicleImageUrl; // <-- THÊM DÒNG NÀY
}