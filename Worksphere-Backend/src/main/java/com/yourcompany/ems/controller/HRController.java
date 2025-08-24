package com.yourcompany.ems.controller;

import com.yourcompany.ems.dto.DepartmentDto;
import com.yourcompany.ems.dto.EmployeeDto;
import com.yourcompany.ems.dto.LeaveRequestDto;
import com.yourcompany.ems.dto.ProjectDto;
import com.yourcompany.ems.service.DepartmentService;
import com.yourcompany.ems.service.EmployeeService;
import com.yourcompany.ems.service.HRDashboardService;
import com.yourcompany.ems.service.LeaveRequestService;
import com.yourcompany.ems.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/hr")
@CrossOrigin(origins = "*")
// @PreAuthorize("hasRole('HR')") // Temporarily disabled for testing
public class HRController {

    private static final Logger logger = LoggerFactory.getLogger(HRController.class);

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private HRDashboardService hrDashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> stats = hrDashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    // Employee CRUD operations
    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeDto>> getAllEmployees() {
        List<EmployeeDto> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/employees/{id}")
    public ResponseEntity<EmployeeDto> getEmployeeById(@PathVariable Long id) {
        EmployeeDto employee = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(employee);
    }

    @PostMapping("/employees")
    public ResponseEntity<EmployeeDto> createEmployee(@Valid @RequestBody EmployeeDto employeeDto) {
        EmployeeDto createdEmployee = employeeService.createEmployee(employeeDto);
        return ResponseEntity.ok(createdEmployee);
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<EmployeeDto> updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeDto employeeDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        logger.info("User '{}' with authorities {} is attempting to update employee {}", authentication.getName(), authentication.getAuthorities(), id);
        EmployeeDto updatedEmployee = employeeService.updateEmployee(id, employeeDto);
        return ResponseEntity.ok(updatedEmployee);
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok().build();
    }

    // Project management
    @GetMapping("/projects")
    public ResponseEntity<List<ProjectDto>> getAllProjects() {
        logger.info("Getting all projects");
        List<ProjectDto> projects = projectService.getAllProjects();
        return ResponseEntity.ok(projects);
    }

    @PostMapping("/projects")
    public ResponseEntity<ProjectDto> createProject(@Valid @RequestBody ProjectDto projectDto) {
        logger.info("Creating project: {}", projectDto.getName());
        try {
            ProjectDto createdProject = projectService.createProject(projectDto);
            logger.info("Project created successfully: {}", createdProject.getName());
            return ResponseEntity.ok(createdProject);
        } catch (Exception e) {
            logger.error("Error creating project: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectDto projectDto) {
        ProjectDto updatedProject = projectService.updateProject(id, projectDto);
        return ResponseEntity.ok(updatedProject);
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok().build();
    }

    // Assign employees to projects
    @PostMapping("/projects/{projectId}/assign/{employeeId}")
    public ResponseEntity<ProjectDto> assignEmployeeToProject(@PathVariable Long projectId, @PathVariable Long employeeId) {
        ProjectDto project = projectService.assignEmployeeToProject(projectId, employeeId);
        return ResponseEntity.ok(project);
    }

    @DeleteMapping("/projects/{projectId}/remove/{employeeId}")
    public ResponseEntity<ProjectDto> removeEmployeeFromProject(@PathVariable Long projectId, @PathVariable Long employeeId) {
        ProjectDto project = projectService.removeEmployeeFromProject(projectId, employeeId);
        return ResponseEntity.ok(project);
    }
    
    // Leave Management
    @Autowired
    private LeaveRequestService leaveRequestService;
    
    @Autowired
    private DepartmentService departmentService;
    
    @GetMapping("/leaves/pending")
    public ResponseEntity<List<LeaveRequestDto>> getPendingLeaves() {
        List<LeaveRequestDto> pendingLeaves = leaveRequestService.getAllPendingLeaves();
        return ResponseEntity.ok(pendingLeaves);
    }
    
    // Department endpoints for HR
    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentDto>> getAllDepartments() {
        List<DepartmentDto> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }
    
    // Recent employees endpoint for HR dashboard
    @GetMapping("/recent-employees")
    public ResponseEntity<List<EmployeeDto>> getRecentEmployees(@RequestParam(defaultValue = "2") int limit) {
        logger.info("Getting recent employees with limit: {}", limit);
        List<EmployeeDto> recentEmployees = employeeService.getRecentEmployees(limit);
        return ResponseEntity.ok(recentEmployees);
    }
    
    // Temporary public endpoint for testing (remove this in production)
    @GetMapping("/public/recent-employees")
    public ResponseEntity<List<EmployeeDto>> getPublicRecentEmployees(@RequestParam(defaultValue = "2") int limit) {
        logger.info("Getting public recent employees with limit: {}", limit);
        List<EmployeeDto> recentEmployees = employeeService.getRecentEmployees(limit);
        return ResponseEntity.ok(recentEmployees);
    }
    
    // Debug endpoint to check departments
    @GetMapping("/debug/departments")
    public ResponseEntity<List<DepartmentDto>> debugDepartments() {
        logger.info("DEBUG: Getting all departments");
        List<DepartmentDto> departments = departmentService.getAllDepartments();
        for (DepartmentDto dept : departments) {
            logger.info("Department: ID={}, Name={}, Code={}", dept.getId(), dept.getName(), dept.getCode());
        }
        return ResponseEntity.ok(departments);
    }
    
}
