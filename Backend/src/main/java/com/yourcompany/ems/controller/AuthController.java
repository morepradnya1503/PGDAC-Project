package com.yourcompany.ems.controller;

import com.yourcompany.ems.dto.LoginRequest;
import com.yourcompany.ems.dto.LoginResponse;
import com.yourcompany.ems.dto.SignupRequest;
import com.yourcompany.ems.service.AuthService;
import com.yourcompany.ems.repository.UserRepository;
import com.yourcompany.ems.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    @Operation(summary = "User Login", description = "Authenticate user and return JWT token")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    @Operation(summary = "User Signup", description = "Register a new user account")
    public ResponseEntity<Map<String, String>> signup(@Valid @RequestBody SignupRequest signupRequest) {
        authService.signup(signupRequest);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    @Operation(summary = "Health Check", description = "Check if the application is running")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("WorkSphere EMS is running!");
    }

    @GetMapping("/me")
    @Operation(summary = "Get Current User Info", description = "Get information about the currently authenticated user")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> userInfo = new HashMap<>();
        
        if (authentication != null && authentication.isAuthenticated()) {
            userInfo.put("username", authentication.getName());
            userInfo.put("authorities", authentication.getAuthorities());
            userInfo.put("authenticated", true);
            userInfo.put("principal", authentication.getPrincipal().getClass().getSimpleName());
        } else {
            userInfo.put("authenticated", false);
            userInfo.put("message", "No authentication found");
        }
        
        return ResponseEntity.ok(userInfo);
    }

    @GetMapping("/debug")
    @Operation(summary = "Debug Authentication", description = "Debug endpoint to check authentication status and roles")
    public ResponseEntity<Map<String, Object>> debugAuth() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> debugInfo = new HashMap<>();
        
        debugInfo.put("authentication", authentication != null ? authentication.getName() : "null");
        debugInfo.put("isAuthenticated", authentication != null && authentication.isAuthenticated());
        debugInfo.put("hasAdminRole", authentication != null && 
                     authentication.getAuthorities().stream()
                     .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN")));
        debugInfo.put("allAuthorities", authentication != null ? 
                     authentication.getAuthorities().toString() : "null");
        
        return ResponseEntity.ok(debugInfo);
    }
    
    @GetMapping("/debug-users")
    @Operation(summary = "Debug Users", description = "Debug endpoint to check users in database")
    public ResponseEntity<Map<String, Object>> debugUsers() {
        Map<String, Object> debugInfo = new HashMap<>();
        
        long userCount = userRepository.count();
        debugInfo.put("userCount", userCount);
        
        if (userCount > 0) {
            java.util.Optional<User> adminUser = userRepository.findByEmail("admin@worksphere.com");
            debugInfo.put("adminUserExists", adminUser.isPresent());
            
            if (adminUser.isPresent()) {
                User admin = adminUser.get();
                debugInfo.put("adminUsername", admin.getUsername());
                debugInfo.put("adminEmail", admin.getEmail());
                debugInfo.put("adminRolesCount", admin.getRoles().size());
                debugInfo.put("adminEnabled", admin.isEnabled());
            }
            
            java.util.Optional<User> adminByUsername = userRepository.findByUsername("admin");
            debugInfo.put("adminByUsernameExists", adminByUsername.isPresent());
        }
        
        return ResponseEntity.ok(debugInfo);
    }
}
