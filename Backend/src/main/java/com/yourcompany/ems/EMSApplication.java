package com.yourcompany.ems;

import com.yourcompany.ems.dto.EmployeeDto;
import com.yourcompany.ems.entity.Employee;
import com.yourcompany.ems.dto.ProjectDto;
import com.yourcompany.ems.entity.Project;
import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
// @EnableMethodSecurity(prePostEnabled = true) // Temporarily disabled for debugging
public class EMSApplication {

    public static void main(String[] args) {
        SpringApplication.run(EMSApplication.class, args);
    }

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        
        // Configure ModelMapper to be more lenient
        modelMapper.getConfiguration()
            .setMatchingStrategy(org.modelmapper.convention.MatchingStrategies.STANDARD)
            .setFieldMatchingEnabled(true)
            .setSkipNullEnabled(true)
            .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE);
        
        // Skip mapping for managerName and managerId in EmployeeDto
        modelMapper.addMappings(new PropertyMap<Employee, EmployeeDto>() {
            @Override
            protected void configure() {
                skip(destination.getManagerName());
                skip(destination.getManagerId());
            }
        });
        // Skip mapping for managerName and managerId in ProjectDto
        modelMapper.addMappings(new PropertyMap<Project, ProjectDto>() {
            @Override
            protected void configure() {
                skip(destination.getManagerName());
                skip(destination.getManagerId());
            }
        });
        
        // Add explicit mapping for EmployeeDto to Employee to resolve ambiguity
        modelMapper.addMappings(new PropertyMap<EmployeeDto, Employee>() {
            @Override
            protected void configure() {
                // Skip the manager property to avoid the ambiguity between managerId and managerName
                skip(destination.getManager());
            }
        });
        
        return modelMapper;
    }


}