package com.yourcompany.ems.service;

import com.yourcompany.ems.entity.LeaveRequest;
import com.yourcompany.ems.entity.Project;
import com.yourcompany.ems.repository.EmployeeRepository;
import com.yourcompany.ems.repository.LeaveRequestRepository;
import com.yourcompany.ems.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class HRDashboardService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private EmployeeService employeeService;

    /**
     * Get HR dashboard statistics including total employees, active projects, pending leaves, and recent employees
     * @return Map containing dashboard statistics
     */
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Get total employees count
        long totalEmployees = employeeRepository.count();
        
        // Get active projects count
        long activeProjects = projectRepository.findByStatus(Project.ProjectStatus.ACTIVE).size();
        
        // Get pending leaves count
        long pendingLeaves = leaveRequestRepository.findByStatus(LeaveRequest.LeaveStatus.PENDING).size();
        
        // Get recent employees (limit to 2 for dashboard)
        // Note: This would require having the EmployeeService injected
        // List<EmployeeDto> recentEmployees = employeeService.getRecentEmployees(2);
        
        stats.put("totalEmployees", totalEmployees);
        stats.put("activeProjects", activeProjects);
        stats.put("pendingLeaves", pendingLeaves);
        // stats.put("recentEmployees", recentEmployees);
        
        return stats;
    }
}