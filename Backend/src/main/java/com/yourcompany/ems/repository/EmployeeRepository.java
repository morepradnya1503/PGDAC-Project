package com.yourcompany.ems.repository;

import com.yourcompany.ems.entity.Employee;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmployeeId(String employeeId);
    Optional<Employee> findByUserUsername(String username);
    Optional<Employee> findByEmail(String email);
    List<Employee> findByManagerId(Long managerId);
    
    @Query("SELECT e FROM Employee e JOIN e.user.roles r WHERE r.name = 'ROLE_HR' AND r.name != 'ROLE_ADMIN'")
    List<Employee> findAllHRs();
    
    @Query("SELECT e FROM Employee e JOIN e.user.roles r WHERE r.name = 'ROLE_MANAGER' AND r.name != 'ROLE_ADMIN'")
    List<Employee> findAllManagers();
    
    @Query("SELECT e FROM Employee e JOIN e.user.roles r WHERE r.name = 'ROLE_EMPLOYEE' AND r.name != 'ROLE_ADMIN'")
    List<Employee> findAllEmployees();
    
    // Find all employees excluding admin users
    @Query("SELECT e FROM Employee e WHERE e.user.id NOT IN (SELECT u.id FROM User u JOIN u.roles r WHERE r.name = 'ROLE_ADMIN')")
    List<Employee> findAllNonAdminEmployees();
    
    // Find recently added employees ordered by creation date
    List<Employee> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    // Find employee with the highest employee ID number (for auto-increment)
    @Query("SELECT e.employeeId FROM Employee e WHERE e.employeeId LIKE 'EMP%' AND LENGTH(e.employeeId) >= 6 ORDER BY CAST(SUBSTRING(e.employeeId, 4) AS INTEGER) DESC")
    List<String> findTopEmployeeIdsByPattern(Pageable pageable);
    
    // Find employee with the highest employee ID (for auto-increment)
    Optional<Employee> findTopByOrderByEmployeeIdDesc();
    
    boolean existsByEmployeeId(String employeeId);
    boolean existsByEmail(String email);
}