package com.yourcompany.ems.repository;

import com.yourcompany.ems.entity.PerformanceFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerformanceFeedbackRepository extends JpaRepository<PerformanceFeedback, Long> {
    List<PerformanceFeedback> findByEmployeeId(Long employeeId);
    List<PerformanceFeedback> findByManagerId(Long managerId);
    List<PerformanceFeedback> findByEmployeeIdAndSprintNumber(Long employeeId, String sprintNumber);
} 