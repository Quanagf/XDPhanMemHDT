package com.evrental.users.dto;

import com.evrental.users.model.User;
import lombok.Data;

@Data
public class RegistrationRequest {
    private String email;
    private String password;
    private String username;
    private String fullName;
    private User.Role role;
}