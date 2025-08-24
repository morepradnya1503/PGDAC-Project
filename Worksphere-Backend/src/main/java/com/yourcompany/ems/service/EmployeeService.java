package com.yourcompany.ems.service;

import com.yourcompany.ems.dto.EmployeeDto;
import com.yourcompany.ems.dto.ProjectDto;
import com.yourcompany.ems.entity.Department;
import com.yourcompany.ems.entity.Employee;
import com.yourcompany.ems.entity.Project;
import com.yourcompany.ems.entity.Role;
import com.yourcompany.ems.entity.User;
import com.yourcompany.ems.repository.DepartmentRepository;
import com.yourcompany.ems.repository.EmployeeRepository;
import com.yourcompany.ems.repository.ProjectRepository;
import com.yourcompany.ems.repository.RoleRepository;
import com.yourcompany.ems.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ProjectRepository projectRepository;
    private final DepartmentRepository departmentRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    
    @Autowired
    public EmployeeService(EmployeeRepository employeeRepository,
                          UserRepository userRepository,
                          RoleRepository roleRepository,
                          ProjectRepository projectRepository,
                          DepartmentRepository departmentRepository,
                          ModelMapper modelMapper,
                          PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.projectRepository = projectRepository;
        this.departmentRepository = departmentRepository;
        this.modelMapper = modelMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public List<EmployeeDto> getAllEmployees() {
        // Exclude admin users from employee lists
        return employeeRepository.findAllNonAdminEmployees().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<EmployeeDto> getRecentEmployees(int limit) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, limit);
        // Get all non-admin employees and then take the limit
        return employeeRepository.findAllNonAdminEmployees().stream()
                .map(this::convertToDto)
                .limit(limit)
                .collect(Collectors.toList());
    }

    public EmployeeDto getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return convertToDto(employee);
    }

    public EmployeeDto getEmployeeByUsername(String username) {
        System.out.println("DEBUG: Looking for employee with username: " + username);
        if (username == null || username.trim().isEmpty()) {
            throw new RuntimeException("Username is required. Please log in to access employee data.");
        }
        
        // Debug: Check if any employees exist
        long employeeCount = employeeRepository.count();
        System.out.println("DEBUG: Total employees in database: " + employeeCount);
        
        // Debug: Check if any users exist
        long userCount = userRepository.count();
        System.out.println("DEBUG: Total users in database: " + userCount);
        
        // Try to find the employee
        Optional<Employee> employeeOptional = employeeRepository.findByUserUsername(username);
        if (employeeOptional.isEmpty()) {
            System.out.println("DEBUG: Employee not found for username: " + username);
            System.out.println("DEBUG: Available employees:");
            employeeRepository.findAll().forEach(emp -> {
                System.out.println("  - Employee ID: " + emp.getId() + ", Name: " + emp.getFullName() + ", User: " + (emp.getUser() != null ? emp.getUser().getUsername() : "null"));
            });
            
            // Try alternative approach: find by email if username is an email
            if (username.contains("@")) {
                System.out.println("DEBUG: Username looks like email, trying email lookup...");
                Optional<Employee> employeeByEmail = employeeRepository.findByEmail(username);
                if (employeeByEmail.isPresent()) {
                    System.out.println("DEBUG: Found employee by email!");
                    return convertToDto(employeeByEmail.get());
                }
            }
            
            throw new RuntimeException("Employee not found for username: " + username + ". Please register an employee account first. Available employees: " + employeeCount);
        }
        
        Employee employee = employeeOptional.get();
        System.out.println("DEBUG: Found employee: " + employee.getFullName() + " (ID: " + employee.getId() + ")");
        return convertToDto(employee);
    }

    /**
     * Get Employee entity (not DTO) by username - used for internal operations
     */
    public Employee getEmployeeEntityByUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new RuntimeException("Username is required");
        }
        
        // Try to find the employee
        Optional<Employee> employeeOptional = employeeRepository.findByUserUsername(username);
        if (employeeOptional.isEmpty()) {
            // Try alternative approach: find by email if username is an email
            if (username.contains("@")) {
                Optional<Employee> employeeByEmail = employeeRepository.findByEmail(username);
                if (employeeByEmail.isPresent()) {
                    return employeeByEmail.get();
                }
            }
            throw new RuntimeException("Employee not found for username: " + username);
        }
        
        return employeeOptional.get();
    }

    public EmployeeDto createEmployee(EmployeeDto employeeDto) {
        // Create user first
        User user = new User();
        user.setUsername(employeeDto.getEmail());
        user.setEmail(employeeDto.getEmail());
        user.setPassword(passwordEncoder.encode("password123")); // Default password
        user.setFirstName(employeeDto.getFirstName());
        user.setLastName(employeeDto.getLastName());

        // Assign role based on employee type (you can modify this logic)
        Role employeeRole = roleRepository.findByName(Role.RoleType.ROLE_EMPLOYEE)
                .orElseThrow(() -> new RuntimeException("Employee role not found"));
        user.getRoles().add(employeeRole);

        user = userRepository.save(user);

        // Create employee - manually map properties to avoid ModelMapper issues
        Employee employee = new Employee();
        employee.setFirstName(employeeDto.getFirstName());
        employee.setLastName(employeeDto.getLastName());
        employee.setEmail(employeeDto.getEmail());
        employee.setContact(employeeDto.getContact() != null ? employeeDto.getContact() : "");
        employee.setAddress(employeeDto.getAddress());
        employee.setCity(employeeDto.getCity());
        employee.setBloodGroup(employeeDto.getBloodGroup());
        employee.setPhotoUrl(employeeDto.getPhotoUrl());
        employee.setSkills(employeeDto.getSkills());
        employee.setExperience(employeeDto.getExperience());
        employee.setEducation(employeeDto.getEducation());
        employee.setHobbies(employeeDto.getHobbies());
        employee.setCertifications(employeeDto.getCertifications());
        employee.setAchievements(employeeDto.getAchievements());
        employee.setDateOfBirth(employeeDto.getDateOfBirth());
        employee.setDateOfJoining(employeeDto.getDateOfJoining());
        
        employee.setUser(user);
        employee.setEmployeeId(generateEmployeeId());

        // Set manager if managerId is provided
        if (employeeDto.getManagerId() != null) {
            Employee manager = employeeRepository.findById(employeeDto.getManagerId())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));
            employee.setManager(manager);
        }
        
        // Set department if departmentId is provided
        if (employeeDto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(employeeDto.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            employee.setDepartment(department);
        }

        employee = employeeRepository.save(employee);
        return convertToDto(employee);
    }

    public EmployeeDto updateEmployee(Long id, EmployeeDto employeeDto) {
        System.out.println("=== BACKEND: UPDATE EMPLOYEE ===" );
        System.out.println("Employee ID: " + id);
        System.out.println("Received DTO: " + employeeDto.toString());
        System.out.println("Department ID from DTO: " + employeeDto.getDepartmentId());
        System.out.println("Date of Joining from DTO: " + employeeDto.getDateOfJoining());
        
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        System.out.println("Current employee department: " + (employee.getDepartment() != null ? employee.getDepartment().getName() : "null"));
        System.out.println("Current employee date of joining: " + employee.getDateOfJoining());
        
        // Update basic fields
        employee.setFirstName(employeeDto.getFirstName());
        employee.setLastName(employeeDto.getLastName());
        employee.setEmail(employeeDto.getEmail());
        if (employeeDto.getContact() != null && !employeeDto.getContact().trim().isEmpty()) {
            employee.setContact(employeeDto.getContact());
        }
        employee.setAddress(employeeDto.getAddress());
        employee.setCity(employeeDto.getCity());
        employee.setBloodGroup(employeeDto.getBloodGroup());
        employee.setPhotoUrl(employeeDto.getPhotoUrl());
        employee.setSkills(employeeDto.getSkills());
        employee.setExperience(employeeDto.getExperience());
        employee.setEducation(employeeDto.getEducation());
        employee.setHobbies(employeeDto.getHobbies());
        employee.setCertifications(employeeDto.getCertifications());
        employee.setAchievements(employeeDto.getAchievements());
        
        // Update dates
        System.out.println("Setting date of joining to: " + employeeDto.getDateOfJoining());
        employee.setDateOfBirth(employeeDto.getDateOfBirth());
        employee.setDateOfJoining(employeeDto.getDateOfJoining());

        // Update employee ID if provided
        if (employeeDto.getEmployeeId() != null && !employeeDto.getEmployeeId().trim().isEmpty()) {
            employee.setEmployeeId(employeeDto.getEmployeeId());
        }

        // Update user's role if provided
        if (employeeDto.getRole() != null && !employeeDto.getRole().trim().isEmpty() && employee.getUser() != null) {
            User user = employee.getUser();
            
            // Clear existing roles
            user.getRoles().clear();
            
            // Add new role
            try {
                String roleStr = employeeDto.getRole();
                // Handle both formats: 'EMPLOYEE' -> 'ROLE_EMPLOYEE'
                if (!roleStr.startsWith("ROLE_")) {
                    roleStr = "ROLE_" + roleStr;
                }
                Role.RoleType roleType = Role.RoleType.valueOf(roleStr);
                Role role = roleRepository.findByName(roleType).orElse(null);
                if (role != null) {
                    user.getRoles().add(role);
                } else {
                    throw new RuntimeException("Role not found: " + roleStr);
                }
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid role: " + employeeDto.getRole() + ". Valid roles are: HR, MANAGER, EMPLOYEE (or ROLE_HR, ROLE_MANAGER, ROLE_EMPLOYEE)");
            }
            
            // Save the updated user
            userRepository.save(user);
        }

        // Update manager if provided
        if (employeeDto.getManagerId() != null) {
            Employee manager = employeeRepository.findById(employeeDto.getManagerId())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));
            employee.setManager(manager);
        }
        
        // Update department if provided
        System.out.println("Checking department update: departmentId = " + employeeDto.getDepartmentId());
        if (employeeDto.getDepartmentId() != null) {
            System.out.println("Finding department with ID: " + employeeDto.getDepartmentId());
            Department department = departmentRepository.findById(employeeDto.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            System.out.println("Found department: " + department.getName());
            employee.setDepartment(department);
            System.out.println("Set employee department to: " + employee.getDepartment().getName());
        } else {
            System.out.println("Department ID is null, not updating department");
        }

        System.out.println("Saving employee with department: " + (employee.getDepartment() != null ? employee.getDepartment().getName() : "null"));
        System.out.println("Saving employee with date of joining: " + employee.getDateOfJoining());
        
        employee = employeeRepository.save(employee);
        
        System.out.println("Employee saved. Final department: " + (employee.getDepartment() != null ? employee.getDepartment().getName() : "null"));
        System.out.println("Employee saved. Final date of joining: " + employee.getDateOfJoining());
        
        EmployeeDto result = convertToDto(employee);
        System.out.println("Returning DTO with department: " + result.getDepartmentName());
        System.out.println("Returning DTO with date of joining: " + result.getDateOfJoining());
        System.out.println("=== BACKEND: UPDATE COMPLETE ===");
        
        return result;
    }

    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }

    public List<EmployeeDto> getEmployeesByManager(Long managerId) {
        return employeeRepository.findByManagerId(managerId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<EmployeeDto> getTeamMembers(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Get employees working on the same projects
        List<Project> projects = projectRepository.findByEmployeeId(employeeId);
        List<Employee> teamMembers = projects.stream()
                .flatMap(project -> project.getEmployees().stream())
                .filter(emp -> !emp.getId().equals(employeeId))
                .distinct()
                .collect(Collectors.toList());

        return teamMembers.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private EmployeeDto convertToDto(Employee employee) {
        // Create DTO manually to avoid ModelMapper issues
        EmployeeDto dto = new EmployeeDto();
        
        // Basic employee information
        dto.setId(employee.getId());
        dto.setEmployeeId(employee.getEmployeeId());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setEmail(employee.getEmail());
        dto.setContact(employee.getContact());
        dto.setAddress(employee.getAddress());
        dto.setCity(employee.getCity());
        dto.setBloodGroup(employee.getBloodGroup());
        dto.setPhotoUrl(employee.getPhotoUrl());
        dto.setSkills(employee.getSkills());
        dto.setExperience(employee.getExperience());
        dto.setEducation(employee.getEducation());
        dto.setHobbies(employee.getHobbies());
        dto.setCertifications(employee.getCertifications());
        dto.setAchievements(employee.getAchievements());
        dto.setDateOfBirth(employee.getDateOfBirth());
        dto.setDateOfJoining(employee.getDateOfJoining());
        dto.setFullName(employee.getFullName());
        
        System.out.println("Converting employee to DTO:");
        System.out.println("Employee date of joining: " + employee.getDateOfJoining());
        System.out.println("Employee department: " + (employee.getDepartment() != null ? employee.getDepartment().getName() + " (ID: " + employee.getDepartment().getId() + ")" : "null"));
        
        // Add role information from user
        if (employee.getUser() != null && employee.getUser().getRoles() != null) {
            String role = employee.getUser().getRoles().stream()
                    .map(roleEntity -> roleEntity.getName().name())
                    .findFirst()
                    .orElse("ROLE_EMPLOYEE");
            dto.setRole(role);
        }
        
        if (employee.getManager() != null) {
            dto.setManagerId(employee.getManager().getId());
            dto.setManagerName(employee.getManager().getFullName());
        }
        
        if (employee.getDepartment() != null) {
            dto.setDepartmentId(employee.getDepartment().getId());
            dto.setDepartmentName(employee.getDepartment().getName());
            dto.setDepartmentCode(employee.getDepartment().getCode());
            System.out.println("Set DTO department ID: " + dto.getDepartmentId());
            System.out.println("Set DTO department name: " + dto.getDepartmentName());
        }
        
        System.out.println("Final DTO date of joining: " + dto.getDateOfJoining());
        System.out.println("Final DTO department ID: " + dto.getDepartmentId());
        System.out.println("Final DTO department name: " + dto.getDepartmentName());

        if (employee.getProjects() != null) {
            dto.setProjects(employee.getProjects().stream()
                    .map(project -> {
                        ProjectDto projectDto = new ProjectDto();
                        projectDto.setId(project.getId());
                        projectDto.setName(project.getName());
                        projectDto.setDescription(project.getDescription());
                        projectDto.setProjectCode(project.getProjectCode());
                        projectDto.setStartDate(project.getStartDate());
                        projectDto.setEndDate(project.getEndDate());
                        projectDto.setStatus(project.getStatus().name());
                        
                        if (project.getManager() != null) {
                            projectDto.setManagerId(project.getManager().getId());
                            projectDto.setManagerName(project.getManager().getFullName());
                        }
                        
                        return projectDto;
                    })
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    private String generateEmployeeId() {
        try {
            // Use efficient query to find the highest employee ID
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 1);
            List<String> topIds = employeeRepository.findTopEmployeeIdsByPattern(pageable);
            
            int maxNumber = 0;
            
            if (!topIds.isEmpty()) {
                String topId = topIds.get(0);
                if (topId != null && topId.startsWith("EMP")) {
                    try {
                        String numberPart = topId.substring(3); // Remove "EMP" prefix
                        maxNumber = Integer.parseInt(numberPart);
                    } catch (NumberFormatException e) {
                        System.out.println("Error parsing top employee ID: " + topId + ", defaulting to 0");
                        maxNumber = 0;
                    }
                }
            }
            
            // Increment and format with zero padding
            int nextNumber = maxNumber + 1;
            String newId = String.format("EMP%03d", nextNumber); // EMP001, EMP002, etc.
            
            System.out.println("Generated new employee ID: " + newId + " (previous max: " + maxNumber + ")");
            return newId;
            
        } catch (Exception e) {
            // Fallback to the original method if query fails
            System.out.println("Query failed, using fallback method: " + e.getMessage());
            return generateEmployeeIdFallback();
        }
    }
    
    private String generateEmployeeIdFallback() {
        // Fallback method - scan all employees manually
        List<Employee> allEmployees = employeeRepository.findAll();
        
        int maxNumber = 0;
        
        // Extract the numeric part from existing employee IDs
        for (Employee employee : allEmployees) {
            String employeeId = employee.getEmployeeId();
            if (employeeId != null && employeeId.startsWith("EMP") && employeeId.length() >= 6) {
                try {
                    String numberPart = employeeId.substring(3); // Remove "EMP" prefix
                    int number = Integer.parseInt(numberPart);
                    if (number > maxNumber) {
                        maxNumber = number;
                    }
                } catch (NumberFormatException e) {
                    // Skip invalid employee IDs
                    System.out.println("Skipping invalid employee ID: " + employeeId);
                }
            }
        }
        
        // Increment and format with zero padding
        int nextNumber = maxNumber + 1;
        return String.format("EMP%03d", nextNumber); // EMP001, EMP002, etc.
    }
    
}
