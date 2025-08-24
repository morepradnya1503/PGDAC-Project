package com.yourcompany.ems.config;

import com.yourcompany.ems.entity.Department;
import com.yourcompany.ems.entity.Employee;
import com.yourcompany.ems.entity.Project;
import com.yourcompany.ems.entity.Role;
import com.yourcompany.ems.entity.User;
import com.yourcompany.ems.repository.DepartmentRepository;
import com.yourcompany.ems.repository.EmployeeRepository;
import com.yourcompany.ems.repository.ProjectRepository;
import com.yourcompany.ems.repository.RoleRepository;
import com.yourcompany.ems.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
        initializeUsers();
        initializeDepartments();
        initializeEmployees();
        initializeProjects();
    }

    private void initializeRoles() {
        if (roleRepository.count() == 0) {
            Role adminRole = new Role();
            adminRole.setName(Role.RoleType.ROLE_ADMIN);
            roleRepository.save(adminRole);

            Role hrRole = new Role();
            hrRole.setName(Role.RoleType.ROLE_HR);
            roleRepository.save(hrRole);

            Role managerRole = new Role();
            managerRole.setName(Role.RoleType.ROLE_MANAGER);
            roleRepository.save(managerRole);

            Role employeeRole = new Role();
            employeeRole.setName(Role.RoleType.ROLE_EMPLOYEE);
            roleRepository.save(employeeRole);
        }
    }

    private void initializeUsers() {
        System.out.println("=== INITIALIZING USERS ===");
        System.out.println("Current user count: " + userRepository.count());
        
        if (userRepository.count() == 0) {
            System.out.println("Creating admin user...");
            
            // Admin User (Only static user credential)
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setPassword(passwordEncoder.encode("Admin@123"));
            adminUser.setEmail("admin@worksphere.com");
            adminUser.setFirstName("Admin");
            adminUser.setLastName("User");
            adminUser.setEnabled(true);
            
            System.out.println("Looking for ROLE_ADMIN...");
            Role adminRole = roleRepository.findByName(Role.RoleType.ROLE_ADMIN).orElse(null);
            if (adminRole == null) {
                System.err.println("ERROR: ROLE_ADMIN not found. Skipping admin user creation.");
                System.err.println("Available roles: " + roleRepository.findAll().size());
            } else {
                System.out.println("Found ROLE_ADMIN, adding to user...");
                adminUser.getRoles().add(adminRole);
                
                System.out.println("Saving admin user...");
                User savedUser = userRepository.save(adminUser);
                System.out.println("✅ SUCCESS: Admin user created with ID: " + savedUser.getId());
                System.out.println("✅ SUCCESS: Use 'admin@worksphere.com' / 'Admin@123' to login.");
                System.out.println("✅ SUCCESS: Admin has roles: " + savedUser.getRoles().size());
            }
            
            // No default users created - users must register through the system
            
            System.out.println("INFO: Additional HR, Manager, and Employee accounts can be created through the registration system.");
        } else {
            System.out.println("Users already exist. Skipping user initialization.");
            System.out.println("Current users in database: " + userRepository.count());
        }
        System.out.println("=== USER INITIALIZATION COMPLETE ===");
    }

    private void initializeDepartments() {
        if (departmentRepository.count() == 0) {
            // Engineering Department
            Department engineeringDept = new Department();
            engineeringDept.setName("Engineering");
            engineeringDept.setDescription("Software development and engineering");
            engineeringDept.setCode("ENG");
            departmentRepository.save(engineeringDept);
            
            // Human Resources Department
            Department hrDept = new Department();
            hrDept.setName("Human Resources");
            hrDept.setDescription("Employee management and recruitment");
            hrDept.setCode("HR");
            departmentRepository.save(hrDept);
            
            // Marketing Department
            Department marketingDept = new Department();
            marketingDept.setName("Marketing");
            marketingDept.setDescription("Product marketing and promotion");
            marketingDept.setCode("MKT");
            departmentRepository.save(marketingDept);
            
            // Finance Department
            Department financeDept = new Department();
            financeDept.setName("Finance");
            financeDept.setDescription("Financial planning and accounting");
            financeDept.setCode("FIN");
            departmentRepository.save(financeDept);
        }
    }
    
    private void initializeEmployees() {
        // Admin does not get an Employee record - admin is purely for system administration
        // Employee records are created only for HR, MANAGER, and EMPLOYEE roles through registration
        System.out.println("INFO: Admin user does not get an Employee ID - admin is for system administration only.");
        System.out.println("INFO: Employee profiles (with auto-increment IDs starting from EMP001) will be created when users register with HR/MANAGER/EMPLOYEE roles.");
    }

    private void initializeProjects() {
        if (projectRepository.count() == 0) {
            // Sample projects will be created when managers register and create them through the system
            System.out.println("INFO: No initial projects created. Projects can be created through the admin/HR dashboard.");
        }
    }
    
}
