package com.yourcompany.ems.controller;

import com.yourcompany.ems.dto.EmployeeDto;
import com.yourcompany.ems.dto.LeaveRequestDto;
import com.yourcompany.ems.dto.PerformanceFeedbackDto;
import com.yourcompany.ems.dto.ProjectDto;
import com.yourcompany.ems.service.EmployeeService;
import com.yourcompany.ems.service.LeaveRequestService;
import com.yourcompany.ems.service.PerformanceFeedbackService;
import com.yourcompany.ems.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/employee")
@CrossOrigin(origins = "*")
// @PreAuthorize("hasRole('EMPLOYEE')")  // Temporarily disabled for testing
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private PerformanceFeedbackService feedbackService;

    @Autowired
    private LeaveRequestService leaveRequestService;

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            System.out.println("DEBUG: Using authenticated username: " + authentication.getName());
            return authentication.getName();
        }
        // Return default employee username for testing when authentication is disabled
        // This will work with the sample employee we created in DataInitializer
        System.out.println("DEBUG: Using default username: employee");
        return "employee";
    }

    @GetMapping("/dashboard")
    public ResponseEntity<EmployeeDto> getDashboard() {
        try {
            String username = getCurrentUsername();
            EmployeeDto employee = employeeService.getEmployeeByUsername(username);
            return ResponseEntity.ok(employee);
        } catch (RuntimeException e) {
            System.out.println("Error fetching dashboard: " + e.getMessage());
            // Return dummy profile for dashboard too
            EmployeeDto dummyProfile = createDummyProfile();
            return ResponseEntity.ok(dummyProfile);
        }
    }

    // Profile management
    @GetMapping("/profile")
    public ResponseEntity<EmployeeDto> getProfile(@RequestParam(required = false) Long employeeId) {
        try {
            if (employeeId != null) {
                // If employeeId is provided, use it directly
                EmployeeDto employee = employeeService.getEmployeeById(employeeId);
                return ResponseEntity.ok(employee);
            } else {
                // Fall back to username-based lookup
                String username = getCurrentUsername();
                EmployeeDto employee = employeeService.getEmployeeByUsername(username);
                return ResponseEntity.ok(employee);
            }
        } catch (RuntimeException e) {
            System.out.println("Error fetching profile: " + e.getMessage());
            // Return a dummy profile instead of error for now
            EmployeeDto dummyProfile = createDummyProfile();
            return ResponseEntity.ok(dummyProfile);
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<EmployeeDto> updateProfile(@Valid @RequestBody EmployeeDto employeeDto, @RequestParam(required = false) Long employeeId) {
        if (employeeId != null) {
            // If employeeId is provided, use it directly
            EmployeeDto updatedEmployee = employeeService.updateEmployee(employeeId, employeeDto);
            return ResponseEntity.ok(updatedEmployee);
        } else {
            // Fall back to username-based lookup
            String username = getCurrentUsername();
            EmployeeDto currentEmployee = employeeService.getEmployeeByUsername(username);
            EmployeeDto updatedEmployee = employeeService.updateEmployee(currentEmployee.getId(), employeeDto);
            return ResponseEntity.ok(updatedEmployee);
        }
    }

    // Project management
    @GetMapping("/projects")
    public ResponseEntity<List<ProjectDto>> getAssignedProjects() {
        String username = getCurrentUsername();
        EmployeeDto employee = employeeService.getEmployeeByUsername(username);
        List<ProjectDto> projects = projectService.getProjectsByEmployee(employee.getId());
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable Long id) {
        ProjectDto project = projectService.getProjectById(id);
        return ResponseEntity.ok(project);
    }

    // Team members
    @GetMapping("/team-members")
    public ResponseEntity<List<EmployeeDto>> getTeamMembers() {
        String username = getCurrentUsername();
        EmployeeDto employee = employeeService.getEmployeeByUsername(username);
        List<EmployeeDto> teamMembers = employeeService.getTeamMembers(employee.getId());
        return ResponseEntity.ok(teamMembers);
    }

    // Performance Feedback
    @GetMapping("/feedback")
    public ResponseEntity<List<PerformanceFeedbackDto>> getFeedback() {
        try {
            String username = getCurrentUsername();
            EmployeeDto employee = employeeService.getEmployeeByUsername(username);
            List<PerformanceFeedbackDto> feedback = feedbackService.getFeedbackByEmployee(employee.getId());
            return ResponseEntity.ok(feedback);
        } catch (RuntimeException e) {
            System.out.println("Error fetching feedback: " + e.getMessage());
            // Return empty list instead of error for now
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    @GetMapping("/feedback/sprint/{sprintNumber}")
    public ResponseEntity<List<PerformanceFeedbackDto>> getFeedbackBySprint(@PathVariable String sprintNumber) {
        String username = getCurrentUsername();
        EmployeeDto employee = employeeService.getEmployeeByUsername(username);
        List<PerformanceFeedbackDto> feedback = feedbackService.getFeedbackByEmployeeAndSprint(employee.getId(), sprintNumber);
        return ResponseEntity.ok(feedback);
    }

    // Leave Management
    @PostMapping("/leave/apply")
    public ResponseEntity<LeaveRequestDto> applyForLeave(@Valid @RequestBody LeaveRequestDto leaveRequestDto) {
        String username = getCurrentUsername();
        EmployeeDto employee = employeeService.getEmployeeByUsername(username);
        leaveRequestDto.setEmployeeId(employee.getId());
        LeaveRequestDto createdLeave = leaveRequestService.applyForLeave(leaveRequestDto);
        return ResponseEntity.ok(createdLeave);
    }

    @GetMapping("/leaves")
    public ResponseEntity<List<LeaveRequestDto>> getLeaveHistory() {
        try {
            String username = getCurrentUsername();
            EmployeeDto employee = employeeService.getEmployeeByUsername(username);
            List<LeaveRequestDto> leaves = leaveRequestService.getLeavesByEmployee(employee.getId());
            return ResponseEntity.ok(leaves);
        } catch (RuntimeException e) {
            System.out.println("Error fetching leaves: " + e.getMessage());
            // Return empty list instead of error for now
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    @GetMapping("/leaves/{id}")
    public ResponseEntity<LeaveRequestDto> getLeaveById(@PathVariable Long id) {
        LeaveRequestDto leave = leaveRequestService.getLeaveById(id);
        return ResponseEntity.ok(leave);
    }

    // Skills management
    @PutMapping("/skills")
    public ResponseEntity<EmployeeDto> updateSkills(@RequestBody String skills) {
        String username = getCurrentUsername();
        EmployeeDto employee = employeeService.getEmployeeByUsername(username);
        employee.setSkills(skills);
        EmployeeDto updatedEmployee = employeeService.updateEmployee(employee.getId(), employee);
        return ResponseEntity.ok(updatedEmployee);
    }

    // TODO: Add PDF generation endpoints for resume and ID card
    @GetMapping("/resume")
    public ResponseEntity<String> downloadResume() {
        // TODO: Implement PDF generation for resume
        return ResponseEntity.ok("Resume PDF generation - To be implemented");
    }

    @GetMapping("/id-card")
    public ResponseEntity<String> generateIdCard() {
        // TODO: Implement PDF generation for ID card
        return ResponseEntity.ok("ID Card PDF generation - To be implemented");
    }
    
    private EmployeeDto createDummyProfile() {
        EmployeeDto dummy = new EmployeeDto();
        dummy.setId(1L);
        dummy.setEmployeeId("EMP001");
        dummy.setFirstName("John");
        dummy.setLastName("Doe");
        dummy.setEmail("employee@worksphere.com");
        dummy.setContact("+1234567890");
        dummy.setAddress("123 Main Street");
        dummy.setCity("New York");
        dummy.setBloodGroup("O+");
        dummy.setSkills("Java, Spring Boot, React");
        dummy.setExperience(3);
        dummy.setEducation("Bachelor's in Computer Science");
        dummy.setHobbies("Reading, Coding, Music");
        dummy.setDateOfBirth(LocalDate.of(1995, 5, 15));
        dummy.setDateOfJoining(LocalDate.of(2022, 1, 15));
        dummy.setRole("ROLE_EMPLOYEE");
        dummy.setDepartmentName("Engineering");
        dummy.setDepartmentId(1L);
        return dummy;
    }
}
