package com.evrental.booking.dto;

import lombok.Data;

@Data
public class CheckInRequest {
    private String staffSignature;
    private String renterSignature;
    private String checkinVehicleImageUrl; // <-- THÊM DÒNG NÀY
}