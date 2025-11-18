package com.evrental.users.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String address;

    @Past(message = "Ngày sinh phải là một ngày trong quá khứ")
    private LocalDate birthDate;

    // Ví dụ: chỉ chấp nhận "Nam", "Nữ", hoặc "Khác"
    @Pattern(regexp = "^(Nam|Nữ|Khác)$", message = "Giới tính không hợp lệ")
    private String gender;

    @Size(max = 255)
    private String facebook;
    
    // email, phoneNumber, licenseNumber và identityNumber không cho phép sửa - lấy từ CSDL
    // licenseNumber và identityNumber sẽ được cập nhật qua API upload riêng
}
