package com.yourcompany.ems.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {
    private Long id;
    private String name;
    private String description;
    private String projectCode;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long managerId;
    private String managerName;
    private List<EmployeeDto> employees;
} 