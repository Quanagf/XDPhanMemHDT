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
    
    // Yêu cầu 12 số cho GPLX
    @Size(min = 12, max = 12, message = "Số giấy phép lái xe phải có đúng 12 ký tự")
    @Pattern(regexp = "^[0-9]*$", message = "Số giấy phép lái xe chỉ được chứa số")
    private String licenseNumber;

    // Yêu cầu 9 hoặc 12 số cho CMND/CCCD
    @Pattern(regexp = "^([0-9]{9}|[0-9]{12})$", message = "Số CMND/CCCD phải là 9 hoặc 12 số")
    private String identityNumber;
    // email và phoneNumber không cho phép sửa - lấy từ CSDL
    // licenseNumber và identityNumber sẽ được cập nhật qua API upload riêng
}
