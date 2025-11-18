package com.evrental.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {
    
    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String username;
    
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
    
    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;
    
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^[0-9]{10}$", message = "Số điện thoại phải có 10 chữ số")
    private String phoneNumber;
    
    private String address;
}
