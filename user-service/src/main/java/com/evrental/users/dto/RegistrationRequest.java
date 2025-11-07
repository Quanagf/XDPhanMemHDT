package com.evrental.users.dto;

import java.time.LocalDate;

import com.evrental.users.model.User;

import lombok.Data;

@Data
public class RegistrationRequest {
    private String phoneNumber;
    private String email;
    private String password;
    private String username;
    private String fullName;
    private LocalDate birthDate; // Ngày sinh
    private User.Role role;
}