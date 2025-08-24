package com.yourcompany.ems.service;

import com.yourcompany.ems.dto.PerformanceFeedbackDto;
import com.yourcompany.ems.entity.Employee;
import com.yourcompany.ems.entity.PerformanceFeedback;
import com.yourcompany.ems.repository.EmployeeRepository;
import com.yourcompany.ems.repository.PerformanceFeedbackRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PerformanceFeedbackService {

    @Autowired
    private PerformanceFeedbackRepository feedbackRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ModelMapper modelMapper;

    public PerformanceFeedbackDto createFeedback(PerformanceFeedbackDto feedbackDto) {
        Employee manager = employeeRepository.findById(feedbackDto.getManagerId())
                .orElseThrow(() -> new RuntimeException("Manager not found"));
        
        Employee employee = employeeRepository.findById(feedbackDto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        PerformanceFeedback feedback = modelMapper.map(feedbackDto, PerformanceFeedback.class);
        feedback.setManager(manager);
        feedback.setEmployee(employee);

        feedback = feedbackRepository.save(feedback);
        return convertToDto(feedback);
    }

    public List<PerformanceFeedbackDto> getFeedbackByEmployee(Long employeeId) {
        return feedbackRepository.findByEmployeeId(employeeId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<PerformanceFeedbackDto> getFeedbackByManager(Long managerId) {
        return feedbackRepository.findByManagerId(managerId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public PerformanceFeedbackDto getFeedbackById(Long id) {
        PerformanceFeedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
        return convertToDto(feedback);
    }

    public PerformanceFeedbackDto updateFeedback(Long id, PerformanceFeedbackDto feedbackDto) {
        PerformanceFeedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        feedback.setSprintNumber(feedbackDto.getSprintNumber());
        feedback.setPerformanceScore(feedbackDto.getPerformanceScore());
        feedback.setComments(feedbackDto.getComments());

        feedback = feedbackRepository.save(feedback);
        return convertToDto(feedback);
    }

    public void deleteFeedback(Long id) {
        feedbackRepository.deleteById(id);
    }

    public List<PerformanceFeedbackDto> getFeedbackByEmployeeAndSprint(Long employeeId, String sprintNumber) {
        return feedbackRepository.findByEmployeeIdAndSprintNumber(employeeId, sprintNumber).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private PerformanceFeedbackDto convertToDto(PerformanceFeedback feedback) {
        PerformanceFeedbackDto dto = modelMapper.map(feedback, PerformanceFeedbackDto.class);
        
        if (feedback.getManager() != null) {
            dto.setManagerId(feedback.getManager().getId());
            dto.setManagerName(feedback.getManager().getFullName());
        }

        if (feedback.getEmployee() != null) {
            dto.setEmployeeId(feedback.getEmployee().getId());
            dto.setEmployeeName(feedback.getEmployee().getFullName());
        }

        return dto;
    }
} 