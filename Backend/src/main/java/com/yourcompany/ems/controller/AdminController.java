package com.yourcompany.ems.controller;

import com.yourcompany.ems.dto.EmployeeDto;
import com.yourcompany.ems.dto.ProjectDto;
import com.yourcompany.ems.service.EmployeeService;
import com.yourcompany.ems.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
@Tag(name = "Admin", description = "Admin management APIs")
public class AdminController {

    private final EmployeeService employeeService;
    private final ProjectService projectService;
    
    @Autowired
    public AdminController(EmployeeService employeeService, ProjectService projectService) {
        this.employeeService = employeeService;
        this.projectService = projectService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin Dashboard", description = "Get admin dashboard statistics (requires ADMIN role)")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            List<EmployeeDto> allEmployees = employeeService.getAllEmployees();
            List<ProjectDto> allProjects = projectService.getAllProjects();

            // Calculate statistics
            long totalEmployees = allEmployees.size();
            long totalHRs = allEmployees.stream()
                    .filter(emp -> emp.getRole() != null && emp.getRole().equals("ROLE_HR"))
                    .count();
            long totalManagers = allEmployees.stream()
                    .filter(emp -> emp.getRole() != null && emp.getRole().equals("ROLE_MANAGER"))
                    .count();
            long totalProjects = allProjects.size();
            long activeProjects = allProjects.stream()
                    .filter(project -> "ACTIVE".equals(project.getStatus()))
                    .count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalEmployees", totalEmployees);
            stats.put("totalHRs", totalHRs);
            stats.put("totalManagers", totalManagers);
            stats.put("totalProjects", totalProjects);
            stats.put("activeProjects", activeProjects);
            
            // Add recent employees (limit to 2 as per requirement)
            List<EmployeeDto> recentEmployees = employeeService.getRecentEmployees(2);
            stats.put("recentEmployees", recentEmployees);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to load dashboard");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/dashboard/public")
    @Operation(summary = "Public Admin Dashboard", description = "Get admin dashboard statistics (public access for testing)")
    public ResponseEntity<Map<String, Object>> getPublicDashboardStats() {
        try {
            List<EmployeeDto> allEmployees = employeeService.getAllEmployees();
            List<ProjectDto> allProjects = projectService.getAllProjects();

            // Calculate statistics
            long totalEmployees = allEmployees.size();
            long totalHRs = allEmployees.stream()
                    .filter(emp -> emp.getRole() != null && emp.getRole().equals("ROLE_HR"))
                    .count();
            long totalManagers = allEmployees.stream()
                    .filter(emp -> emp.getRole() != null && emp.getRole().equals("ROLE_MANAGER"))
                    .count();
            long totalProjects = allProjects.size();
            long activeProjects = allProjects.stream()
                    .filter(project -> "ACTIVE".equals(project.getStatus()))
                    .count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalEmployees", totalEmployees);
            stats.put("totalHRs", totalHRs);
            stats.put("totalManagers", totalManagers);
            stats.put("totalProjects", totalProjects);
            stats.put("activeProjects", activeProjects);
            
            // Add recent employees (limit to 2 as per requirement)
            List<EmployeeDto> recentEmployees = employeeService.getRecentEmployees(2);
            stats.put("recentEmployees", recentEmployees);
            
            stats.put("note", "This is a public endpoint for testing purposes");

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to load dashboard");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/employees")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get All Employees", description = "Get all employees (requires ADMIN role)")
    public ResponseEntity<List<EmployeeDto>> getAllEmployees() {
        List<EmployeeDto> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(employees);
    }
    
    @GetMapping("/recent-employees")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get Recent Employees", description = "Get recent employees for dashboard (requires ADMIN role)")
    public ResponseEntity<List<EmployeeDto>> getRecentEmployees(@RequestParam(defaultValue = "2") int limit) {
        List<EmployeeDto> recentEmployees = employeeService.getRecentEmployees(limit);
        return ResponseEntity.ok(recentEmployees);
    }
    
    @GetMapping("/public/recent-employees")
    @Operation(summary = "Get Recent Employees (Public)", description = "Get recent employees for dashboard (public access for testing)")
    public ResponseEntity<List<EmployeeDto>> getPublicRecentEmployees(@RequestParam(defaultValue = "2") int limit) {
        List<EmployeeDto> recentEmployees = employeeService.getRecentEmployees(limit);
        return ResponseEntity.ok(recentEmployees);
    }

    @GetMapping("/projects")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get All Projects", description = "Get all projects (requires ADMIN role)")
    public ResponseEntity<List<ProjectDto>> getAllProjects() {
        List<ProjectDto> projects = projectService.getAllProjects();
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/employees/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get Employee by ID", description = "Get employee by ID (requires ADMIN role)")
    public ResponseEntity<EmployeeDto> getEmployeeById(@PathVariable Long id) {
        EmployeeDto employee = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(employee);
    }

    @GetMapping("/projects/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get Project by ID", description = "Get project by ID (requires ADMIN role)")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable Long id) {
        ProjectDto project = projectService.getProjectById(id);
        return ResponseEntity.ok(project);
    }
}