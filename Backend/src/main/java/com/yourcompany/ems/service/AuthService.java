package com.yourcompany.ems.service;

import com.yourcompany.ems.dto.LoginRequest;
import com.yourcompany.ems.dto.LoginResponse;
import com.yourcompany.ems.dto.SignupRequest;
import com.yourcompany.ems.entity.Employee;
import com.yourcompany.ems.entity.Role;
import com.yourcompany.ems.entity.User;
import com.yourcompany.ems.repository.EmployeeRepository;
import com.yourcompany.ems.repository.RoleRepository;
import com.yourcompany.ems.repository.UserRepository;
import com.yourcompany.ems.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.List;
import org.springframework.data.domain.PageRequest;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest loginRequest) {
        logger.info("🔐 Login attempt for: {}", loginRequest.getEmail());
        
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );
        logger.info("✅ Authentication successful");

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        logger.info("📝 UserDetails username: {}", userDetails.getUsername());
        
        String token = jwtUtil.generateToken(userDetails);
        logger.info("🔑 JWT token generated");

        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        logger.info("👤 User lookup result: {}", user != null ? "Found (ID: " + user.getId() + ")" : "NOT FOUND");
        
        Employee employee = employeeRepository.findByUserUsername(userDetails.getUsername()).orElse(null);
        logger.info("👷 Employee lookup result: {}", employee != null ? "Found (ID: " + employee.getId() + ")" : "NOT FOUND");

        Set<String> roles = userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.toSet());

        String userType = determineUserType(roles);

        // Construct full name safely
        String fullName;
        if (employee != null) {
            fullName = employee.getFullName();
        } else if (user != null && user.getFirstName() != null && user.getLastName() != null) {
            fullName = user.getFirstName() + " " + user.getLastName();
        } else {
            // Fallback to username if user data is not available
            fullName = userDetails.getUsername().split("@")[0]; // Use part before @ as name
        }
        
        return new LoginResponse(
                token,
                userDetails.getUsername(),
                user != null ? user.getEmail() : userDetails.getUsername(),
                fullName,
                roles,
                userType,
                user != null ? user.getId() : null,
                employee != null ? employee.getEmployeeId() : null
        );
    }

    public void signup(SignupRequest signupRequest) {
        // Check if email already exists
        if (userRepository.findByEmail(signupRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setUsername(signupRequest.getEmail()); // Use email as username
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setEmail(signupRequest.getEmail());
        user.setFirstName(signupRequest.getFirstName());
        user.setLastName(signupRequest.getLastName());

        // Assign role based on signup request
        Set<Role> roles = new HashSet<>();
        try {
            Role.RoleType roleType = Role.RoleType.valueOf("ROLE_" + signupRequest.getRole());
            Role role = roleRepository.findByName(roleType).orElse(null);
            if (role != null) {
                roles.add(role);
            } else {
                throw new RuntimeException("Role not found: " + signupRequest.getRole());
            }
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + signupRequest.getRole() + ". Valid roles are: HR, MANAGER, EMPLOYEE");
        }
        user.setRoles(roles);

        // Save user
        userRepository.save(user);

        // Create employee record only for HR, MANAGER, and EMPLOYEE roles (not for ADMIN)
        if (!signupRequest.getRole().equals("ADMIN")) {
            Employee employee = new Employee();
            employee.setUser(user);
            employee.setEmployeeId(generateNextEmployeeId());
            employee.setFirstName(signupRequest.getFirstName());
            employee.setLastName(signupRequest.getLastName());
            employee.setEmail(user.getEmail());
            employee.setContact(""); // Default empty contact
            employeeRepository.save(employee);
        }
    }

    private String determineUserType(Set<String> roles) {
        if (roles.contains("ROLE_ADMIN")) return "ADMIN";
        if (roles.contains("ROLE_HR")) return "HR";
        if (roles.contains("ROLE_MANAGER")) return "MANAGER";
        if (roles.contains("ROLE_EMPLOYEE")) return "EMPLOYEE";
        return "USER";
    }

    private String generateNextEmployeeId() {
        // Get the highest employee ID number using proper numeric sorting
        List<String> topEmployeeIds = employeeRepository.findTopEmployeeIdsByPattern(PageRequest.of(0, 1));
        
        String lastEmployeeId;
        if (topEmployeeIds.isEmpty()) {
            lastEmployeeId = "EMP000"; // Default if no employees exist
        } else {
            lastEmployeeId = topEmployeeIds.get(0);
        }
        
        // Extract the numeric part and increment
        String numericPart = lastEmployeeId.substring(3); // Remove "EMP" prefix
        int nextNumber;
        try {
            nextNumber = Integer.parseInt(numericPart) + 1;
        } catch (NumberFormatException e) {
            // If parsing fails, start from 1
            nextNumber = 1;
        }
        
        // Format with leading zeros to maintain EMP001, EMP002, etc.
        return String.format("EMP%03d", nextNumber);
    }
    
    private String generateEmployeeId() {
        // Legacy method - kept for backward compatibility
        return generateNextEmployeeId();
    }
} 