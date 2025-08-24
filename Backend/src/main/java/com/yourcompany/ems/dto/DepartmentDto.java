package com.yourcompany.ems.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentDto {
    private Long id;
    private String name;
    private String description;
    private String code;
    private List<EmployeeDto> employees;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}