package com.yourcompany.ems.repository;

import com.yourcompany.ems.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByProjectCode(String projectCode);
    List<Project> findByManagerId(Long managerId);
    List<Project> findByStatus(Project.ProjectStatus status);
    
    @Query("SELECT p FROM Project p JOIN p.employees e WHERE e.id = :employeeId")
    List<Project> findByEmployeeId(Long employeeId);
    
    boolean existsByProjectCode(String projectCode);
} 