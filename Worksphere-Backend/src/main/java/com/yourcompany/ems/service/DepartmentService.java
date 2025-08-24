package com.yourcompany.ems.service;

import com.yourcompany.ems.dto.DepartmentDto;
import com.yourcompany.ems.dto.EmployeeDto;
import com.yourcompany.ems.entity.Department;
import com.yourcompany.ems.entity.Employee;
import com.yourcompany.ems.repository.DepartmentRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ModelMapper modelMapper;

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public DepartmentDto getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        return convertToDto(department);
    }

    public DepartmentDto createDepartment(DepartmentDto departmentDto) {
        // Validate department name and code uniqueness
        if (departmentRepository.existsByName(departmentDto.getName())) {
            throw new RuntimeException("Department name already exists");
        }
        if (departmentRepository.existsByCode(departmentDto.getCode())) {
            throw new RuntimeException("Department code already exists");
        }

        Department department = modelMapper.map(departmentDto, Department.class);
        department = departmentRepository.save(department);
        return convertToDto(department);
    }

    public DepartmentDto updateDepartment(Long id, DepartmentDto departmentDto) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        // Check if name is being changed and if it's unique
        if (!department.getName().equals(departmentDto.getName()) && 
            departmentRepository.existsByName(departmentDto.getName())) {
            throw new RuntimeException("Department name already exists");
        }

        // Check if code is being changed and if it's unique
        if (!department.getCode().equals(departmentDto.getCode()) && 
            departmentRepository.existsByCode(departmentDto.getCode())) {
            throw new RuntimeException("Department code already exists");
        }

        department.setName(departmentDto.getName());
        department.setDescription(departmentDto.getDescription());
        department.setCode(departmentDto.getCode());

        department = departmentRepository.save(department);
        return convertToDto(department);
    }

    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        
        // Check if department has employees
        if (!department.getEmployees().isEmpty()) {
            throw new RuntimeException("Cannot delete department with assigned employees");
        }
        
        departmentRepository.deleteById(id);
    }

    private DepartmentDto convertToDto(Department department) {
        DepartmentDto dto = modelMapper.map(department, DepartmentDto.class);
        
        // Map employees if needed
        if (department.getEmployees() != null) {
            dto.setEmployees(department.getEmployees().stream()
                    .map(employee -> {
                        EmployeeDto employeeDto = new EmployeeDto();
                        employeeDto.setId(employee.getId());
                        employeeDto.setFirstName(employee.getFirstName());
                        employeeDto.setLastName(employee.getLastName());
                        employeeDto.setEmail(employee.getEmail());
                        employeeDto.setEmployeeId(employee.getEmployeeId());
                        return employeeDto;
                    })
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
}