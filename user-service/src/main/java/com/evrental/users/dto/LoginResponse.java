package com.evrental.users.dto;

import com.evrental.users.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private User.Role role;
}