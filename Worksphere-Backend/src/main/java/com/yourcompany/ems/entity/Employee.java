package com.yourcompany.ems.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String employeeId;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String contact;
    
    private String address;
    private String city;
    private String bloodGroup;
    private String photoUrl;
    
    @Column(columnDefinition = "TEXT")
    private String skills;
    
    private Integer experience;
    
    @Column(columnDefinition = "TEXT")
    private String education;
    
    @Column(columnDefinition = "TEXT")
    private String hobbies;
    
    @Column(columnDefinition = "TEXT")
    private String certifications;
    
    @Column(columnDefinition = "TEXT")
    private String achievements;
    
    private LocalDate dateOfBirth;
    private LocalDate dateOfJoining;
    
    @ManyToOne
    @JoinColumn(name = "manager_id")
    private Employee manager;
    
    @OneToMany(mappedBy = "manager", cascade = CascadeType.ALL)
    private List<Employee> subordinates = new ArrayList<>();
    
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
    
    @ManyToMany
    @JoinTable(
        name = "employee_projects",
        joinColumns = @JoinColumn(name = "employee_id"),
        inverseJoinColumns = @JoinColumn(name = "project_id")
    )
    private List<Project> projects = new ArrayList<>();
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt;
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
}