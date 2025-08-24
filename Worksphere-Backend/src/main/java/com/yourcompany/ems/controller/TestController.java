package com.yourcompany.ems.controller;

import com.yourcompany.ems.dto.ProjectDto;
import com.yourcompany.ems.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private ProjectService projectService;

    @GetMapping("/auth-info")
    public Map<String, Object> getAuthInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> authInfo = new HashMap<>();
        
        if (authentication != null && authentication.isAuthenticated()) {
            authInfo.put("authenticated", true);
            authInfo.put("username", authentication.getName());
            authInfo.put("authorities", authentication.getAuthorities());
            authInfo.put("principal", authentication.getPrincipal().getClass().getSimpleName());
        } else {
            authInfo.put("authenticated", false);
        }
        
        return authInfo;
    }

    @GetMapping("/hr-test")
    public Map<String, Object> testHRAccess() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> result = new HashMap<>();
        
        result.put("message", "HR endpoint accessed successfully");
        result.put("user", authentication.getName());
        result.put("authorities", authentication.getAuthorities());
        
        return result;
    }

    @GetMapping("/public")
    public Map<String, Object> publicTest() {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Public endpoint accessed successfully");
        result.put("timestamp", System.currentTimeMillis());
        return result;
    }

    @PostMapping("/create-project")
    public Map<String, Object> createTestProject(@RequestBody ProjectDto projectDto) {
        Map<String, Object> result = new HashMap<>();
        try {
            ProjectDto createdProject = projectService.createProject(projectDto);
            result.put("success", true);
            result.put("project", createdProject);
            result.put("message", "Project created successfully");
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("message", "Failed to create project");
        }
        return result;
    }

    @PostMapping("/create-simple-project")
    public Map<String, Object> createSimpleProject() {
        Map<String, Object> result = new HashMap<>();
        try {
            ProjectDto projectDto = new ProjectDto();
            projectDto.setName("Test Project");
            projectDto.setDescription("A simple test project");
            projectDto.setProjectCode("TEST001");
            projectDto.setStatus("ACTIVE");
            projectDto.setStartDate(LocalDate.now());
            projectDto.setEndDate(LocalDate.now().plusMonths(3));
            
            ProjectDto createdProject = projectService.createProject(projectDto);
            result.put("success", true);
            result.put("project", createdProject);
            result.put("message", "Simple project created successfully");
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("message", "Failed to create simple project");
        }
        return result;
    }
} 