package com.yourcompany.ems.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDto {
    private Long id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private String contact;
    private String address;
    private String city;
    private String bloodGroup;
    private String photoUrl;
    private String skills;
    private Integer experience;
    private String education;
    private String hobbies;
    private String certifications;
    private String achievements;
    private LocalDate dateOfBirth;
    private LocalDate dateOfJoining;
    private Long managerId;
    private String managerName;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private List<ProjectDto> projects;
    private String fullName;
    private String role; // Add role field
    
    @Override
    public String toString() {
        return "EmployeeDto{" +
                "id=" + id +
                ", employeeId='" + employeeId + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", departmentId=" + departmentId +
                ", departmentName='" + departmentName + '\'' +
                ", dateOfJoining=" + dateOfJoining +
                ", role='" + role + '\'' +
                '}';
    }
}
