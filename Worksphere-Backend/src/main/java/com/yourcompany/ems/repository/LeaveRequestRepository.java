package com.yourcompany.ems.repository;

import com.yourcompany.ems.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeId(Long employeeId);
    List<LeaveRequest> findByManagerId(Long managerId);
    List<LeaveRequest> findByManagerIdAndStatus(Long managerId, LeaveRequest.LeaveStatus status);
    List<LeaveRequest> findByEmployeeIdAndStatus(Long employeeId, LeaveRequest.LeaveStatus status);
    List<LeaveRequest> findByStatus(LeaveRequest.LeaveStatus status);
}