package com.evrental.users.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String address;
    private LocalDate birthDate;
    private String gender;
    private String facebook;
    // email và phoneNumber không cho phép sửa - lấy từ CSDL
    // licenseNumber và identityNumber sẽ được cập nhật qua API upload riêng
}
