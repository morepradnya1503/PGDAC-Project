package com.yourcompany.ems.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String username;
    private String email;
    private String fullName;
    private Set<String> roles;
    private String userType; // ADMIN, HR, MANAGER, EMPLOYEE
    private Long userId;
    private String employeeId; // EMP001, EMP002, etc.
}
