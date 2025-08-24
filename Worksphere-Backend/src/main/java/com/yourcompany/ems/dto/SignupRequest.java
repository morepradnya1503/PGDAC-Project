package com.yourcompany.ems.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
    @NotBlank(message = "First name is required")
    @Size(min = 2, message = "First name must be at least 2 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, message = "Last name must be at least 2 characters")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).*$", 
             message = "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 special symbol")
    private String password;
    
    @NotBlank(message = "Role is required")
    private String role;
} 