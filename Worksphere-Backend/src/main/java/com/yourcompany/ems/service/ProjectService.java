package com.yourcompany.ems.service;

import com.yourcompany.ems.dto.EmployeeDto;
import com.yourcompany.ems.dto.ProjectDto;
import com.yourcompany.ems.entity.Employee;
import com.yourcompany.ems.entity.Project;
import com.yourcompany.ems.repository.EmployeeRepository;
import com.yourcompany.ems.repository.ProjectRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;
    private final ModelMapper modelMapper;
    
    @Autowired
    public ProjectService(ProjectRepository projectRepository,
                         EmployeeRepository employeeRepository,
                         ModelMapper modelMapper) {
        this.projectRepository = projectRepository;
        this.employeeRepository = employeeRepository;
        this.modelMapper = modelMapper;
    }

    public List<ProjectDto> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ProjectDto getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return convertToDto(project);
    }

    public ProjectDto createProject(ProjectDto projectDto) {
        Project project = new Project();
        
        // Set basic properties
        project.setName(projectDto.getName());
        project.setDescription(projectDto.getDescription());
        project.setProjectCode(projectDto.getProjectCode() != null ? projectDto.getProjectCode() : generateProjectCode());
        project.setStatus(Project.ProjectStatus.valueOf(projectDto.getStatus()));
        project.setStartDate(projectDto.getStartDate());
        project.setEndDate(projectDto.getEndDate());

        // Set manager if provided
        if (projectDto.getManagerId() != null) {
            try {
                Employee manager = employeeRepository.findById(projectDto.getManagerId())
                        .orElseThrow(() -> new RuntimeException("Manager not found with ID: " + projectDto.getManagerId()));
                project.setManager(manager);
            } catch (Exception e) {
                // Log the error but don't fail the project creation
                System.err.println("Warning: Could not set manager: " + e.getMessage());
            }
        }

        // Set employees if provided - make this optional
        if (projectDto.getEmployees() != null && !projectDto.getEmployees().isEmpty()) {
            List<Employee> employees = new ArrayList<>();
            for (com.yourcompany.ems.dto.EmployeeDto empDto : projectDto.getEmployees()) {
                if (empDto.getId() != null) {
                    try {
                        Employee employee = employeeRepository.findById(empDto.getId())
                                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + empDto.getId()));
                        employees.add(employee);
                    } catch (Exception e) {
                        // Log the error but don't fail the project creation
                        System.err.println("Warning: Could not add employee with ID " + empDto.getId() + ": " + e.getMessage());
                    }
                }
            }
            project.setEmployees(employees);
        }

        project = projectRepository.save(project);
        return convertToDto(project);
    }

    public ProjectDto updateProject(Long id, ProjectDto projectDto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        project.setName(projectDto.getName());
        project.setDescription(projectDto.getDescription());
        project.setStatus(Project.ProjectStatus.valueOf(projectDto.getStatus()));
        project.setStartDate(projectDto.getStartDate());
        project.setEndDate(projectDto.getEndDate());

        if (projectDto.getManagerId() != null) {
            Employee manager = employeeRepository.findById(projectDto.getManagerId())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));
            project.setManager(manager);
        }

        project = projectRepository.save(project);
        return convertToDto(project);
    }

    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    public List<ProjectDto> getProjectsByManager(Long managerId) {
        return projectRepository.findByManagerId(managerId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProjectDto> getProjectsByEmployee(Long employeeId) {
        return projectRepository.findByEmployeeId(employeeId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ProjectDto assignEmployeeToProject(Long projectId, Long employeeId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        project.getEmployees().add(employee);
        project = projectRepository.save(project);
        return convertToDto(project);
    }

    public ProjectDto removeEmployeeFromProject(Long projectId, Long employeeId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        project.getEmployees().removeIf(emp -> emp.getId().equals(employeeId));
        project = projectRepository.save(project);
        return convertToDto(project);
    }

    private ProjectDto convertToDto(Project project) {
        ProjectDto dto = modelMapper.map(project, ProjectDto.class);
        
        if (project.getManager() != null) {
            dto.setManagerId(project.getManager().getId());
            dto.setManagerName(project.getManager().getFullName());
        }

        if (project.getEmployees() != null) {
            dto.setEmployees(project.getEmployees().stream()
                    .map(emp -> {
                        EmployeeDto employeeDto = new EmployeeDto();
                        employeeDto.setId(emp.getId());
                        employeeDto.setFirstName(emp.getFirstName());
                        employeeDto.setLastName(emp.getLastName());
                        employeeDto.setEmail(emp.getEmail());
                        employeeDto.setEmployeeId(emp.getEmployeeId());
                        employeeDto.setFullName(emp.getFullName());
                        
                        if (emp.getManager() != null) {
                            employeeDto.setManagerId(emp.getManager().getId());
                            employeeDto.setManagerName(emp.getManager().getFullName());
                        }
                        
                        if (emp.getDepartment() != null) {
                            employeeDto.setDepartmentId(emp.getDepartment().getId());
                            employeeDto.setDepartmentName(emp.getDepartment().getName());
                        }
                        
                        return employeeDto;
                    })
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    private String generateProjectCode() {
        // Simple project code generation - you can make this more sophisticated
        return "PRJ" + System.currentTimeMillis();
    }
}