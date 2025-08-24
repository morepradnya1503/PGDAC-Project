package com.yourcompany.ems.controller;

import com.yourcompany.ems.dto.EmployeeDto;
import com.yourcompany.ems.dto.LeaveRequestDto;
import com.yourcompany.ems.dto.PerformanceFeedbackDto;
import com.yourcompany.ems.dto.ProjectDto;
import com.yourcompany.ems.entity.Employee;
import com.yourcompany.ems.service.EmployeeService;
import com.yourcompany.ems.service.LeaveRequestService;
import com.yourcompany.ems.service.PerformanceFeedbackService;
import com.yourcompany.ems.service.ProjectService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/manager")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('MANAGER')")
public class ManagerController {

    private static final Logger logger = LoggerFactory.getLogger(ManagerController.class);

    @Autowired
    private ProjectService projectService;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private PerformanceFeedbackService feedbackService;

    @Autowired
    private LeaveRequestService leaveRequestService;

    /**
     * Helper method to get the current manager's employee ID from JWT token
     */
    private Long getCurrentManagerId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                String username = userDetails.getUsername();
                logger.debug("Getting manager ID for username: {}", username);
                
                // Get the employee record for this user
                Employee manager = employeeService.getEmployeeEntityByUsername(username);
                if (manager != null) {
                    logger.debug("Found manager with ID: {}", manager.getId());
                    return manager.getId();
                } else {
                    logger.warn("No employee record found for manager username: {}", username);
                }
            }
        } catch (Exception e) {
            logger.error("Error getting current manager ID: ", e);
        }
        
        // Fallback for demo/testing
        logger.warn("Using fallback manager ID: 1");
        return 1L;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<List<ProjectDto>> getDashboard() {
        try {
            Long managerId = getCurrentManagerId();
            logger.info("Manager dashboard requested by manager ID: {}", managerId);
            List<ProjectDto> projects = projectService.getProjectsByManager(managerId);
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            logger.error("Error fetching manager dashboard: ", e);
            return ResponseEntity.ok(List.of()); // Return empty list on error
        }
    }

    @GetMapping("/test/current-manager")
    public ResponseEntity<Object> getCurrentManagerInfo() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Long managerId = getCurrentManagerId();
            
            Map<String, Object> info = new HashMap<>();
            info.put("authenticated", authentication != null);
            info.put("principal", authentication != null ? authentication.getPrincipal().getClass().getSimpleName() : null);
            info.put("username", authentication != null && authentication.getPrincipal() instanceof UserDetails ? 
                     ((UserDetails) authentication.getPrincipal()).getUsername() : "Anonymous");
            info.put("managerId", managerId);
            info.put("authorities", authentication != null ? authentication.getAuthorities() : null);
            
            logger.info("Manager info: {}", info);
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            logger.error("Error getting current manager info: ", e);
            return ResponseEntity.ok(Map.of("error", e.getMessage()));
        }
    }

    // Project management
    @GetMapping("/projects")
    public ResponseEntity<List<ProjectDto>> getAssignedProjects() {
        try {
            Long managerId = getCurrentManagerId();
            logger.info("Getting projects for manager ID: {}", managerId);
            List<ProjectDto> projects = projectService.getProjectsByManager(managerId);
            logger.debug("Found {} projects for manager", projects.size());
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            logger.error("Error fetching manager projects: ", e);
            return ResponseEntity.ok(List.of()); // Return empty list on error
        }
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable Long id) {
        try {
            // Verify this project belongs to the current manager
            Long managerId = getCurrentManagerId();
            ProjectDto project = projectService.getProjectById(id);
            
            // Check if this manager owns this project
            if (!project.getManagerId().equals(managerId)) {
                logger.warn("Manager {} attempted to access project {} owned by manager {}", 
                           managerId, id, project.getManagerId());
                return ResponseEntity.status(403).build();
            }
            
            return ResponseEntity.ok(project);
        } catch (Exception e) {
            logger.error("Error fetching project {}: ", id, e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/projects/{id}/employees")
    public ResponseEntity<List<EmployeeDto>> getProjectEmployees(@PathVariable Long id) {
        try {
            // Verify this project belongs to the current manager
            Long managerId = getCurrentManagerId();
            ProjectDto project = projectService.getProjectById(id);
            
            // Check if this manager owns this project
            if (!project.getManagerId().equals(managerId)) {
                logger.warn("Manager {} attempted to access employees of project {} owned by manager {}", 
                           managerId, id, project.getManagerId());
                return ResponseEntity.status(403).build();
            }
            
            return ResponseEntity.ok(project.getEmployees());
        } catch (Exception e) {
            logger.error("Error fetching employees for project {}: ", id, e);
            return ResponseEntity.notFound().build();
        }
    }

    // Employee management
    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeDto>> getSubordinates() {
        try {
            Long managerId = getCurrentManagerId();
            logger.info("Getting subordinates for manager ID: {}", managerId);
            List<EmployeeDto> subordinates = employeeService.getEmployeesByManager(managerId);
            logger.debug("Found {} subordinates for manager", subordinates.size());
            return ResponseEntity.ok(subordinates);
        } catch (Exception e) {
            logger.error("Error fetching manager subordinates: ", e);
            return ResponseEntity.ok(List.of()); // Return empty list on error
        }
    }

    // Performance Feedback
    @PostMapping("/feedback")
    public ResponseEntity<PerformanceFeedbackDto> submitFeedback(@Valid @RequestBody PerformanceFeedbackDto feedbackDto) {
        try {
            Long managerId = getCurrentManagerId();
            feedbackDto.setManagerId(managerId);
            PerformanceFeedbackDto createdFeedback = feedbackService.createFeedback(feedbackDto);
            return ResponseEntity.ok(createdFeedback);
        } catch (Exception e) {
            logger.error("Error submitting feedback: ", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/feedback")
    public ResponseEntity<List<PerformanceFeedbackDto>> getSubmittedFeedback() {
        try {
            Long managerId = getCurrentManagerId();
            List<PerformanceFeedbackDto> feedback = feedbackService.getFeedbackByManager(managerId);
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            logger.error("Error fetching feedback: ", e);
            return ResponseEntity.ok(List.of()); // Return empty list on error
        }
    }

    @PutMapping("/feedback/{id}")
    public ResponseEntity<PerformanceFeedbackDto> updateFeedback(@PathVariable Long id, @Valid @RequestBody PerformanceFeedbackDto feedbackDto) {
        PerformanceFeedbackDto updatedFeedback = feedbackService.updateFeedback(id, feedbackDto);
        return ResponseEntity.ok(updatedFeedback);
    }

    @DeleteMapping("/feedback/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.ok().build();
    }

    // Leave Management
    @GetMapping("/leaves/pending")
    public ResponseEntity<List<LeaveRequestDto>> getPendingLeaves() {
        try {
            Long managerId = getCurrentManagerId();
            List<LeaveRequestDto> pendingLeaves = leaveRequestService.getPendingLeavesByManager(managerId);
            return ResponseEntity.ok(pendingLeaves);
        } catch (Exception e) {
            logger.error("Error fetching pending leaves: ", e);
            return ResponseEntity.ok(List.of()); // Return empty list on error
        }
    }

    @PutMapping("/leave/approve/{id}")
    public ResponseEntity<LeaveRequestDto> approveLeave(@PathVariable Long id) {
        LeaveRequestDto approvedLeave = leaveRequestService.approveLeave(id);
        return ResponseEntity.ok(approvedLeave);
    }

    @PutMapping("/leave/reject/{id}")
    public ResponseEntity<LeaveRequestDto> rejectLeave(@PathVariable Long id) {
        LeaveRequestDto rejectedLeave = leaveRequestService.rejectLeave(id);
        return ResponseEntity.ok(rejectedLeave);
    }

    @GetMapping("/leaves")
    public ResponseEntity<List<LeaveRequestDto>> getAllLeaves() {
        try {
            Long managerId = getCurrentManagerId();
            List<LeaveRequestDto> allLeaves = leaveRequestService.getAllLeavesByManager(managerId);
            return ResponseEntity.ok(allLeaves);
        } catch (Exception e) {
            logger.error("Error fetching all leaves: ", e);
            return ResponseEntity.ok(List.of()); // Return empty list on error
        }
    }
} 