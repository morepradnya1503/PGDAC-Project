package com.yourcompany.ems.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceFeedbackDto {
    private Long id;
    private Long managerId;
    private String managerName;
    private Long employeeId;
    private String employeeName;
    private String sprintNumber;
    private Integer performanceScore;
    private String comments;
    private LocalDateTime createdAt;
} 