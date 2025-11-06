package com.evrental.users.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String username;
    private String phoneNumber;
    private String password;
}