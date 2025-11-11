package com.evrental.users.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;  // Chỉ dùng username để đăng nhập
    private String password;
}