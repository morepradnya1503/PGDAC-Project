package com.yourcompany.ems.service;

import com.yourcompany.ems.dto.LeaveRequestDto;
import com.yourcompany.ems.entity.Employee;
import com.yourcompany.ems.entity.LeaveRequest;
import com.yourcompany.ems.repository.EmployeeRepository;
import com.yourcompany.ems.repository.LeaveRequestRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveRequestService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ModelMapper modelMapper;

    public LeaveRequestDto applyForLeave(LeaveRequestDto leaveRequestDto) {
        Employee employee = employeeRepository.findById(leaveRequestDto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        Employee manager = employeeRepository.findById(leaveRequestDto.getManagerId())
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        LeaveRequest leaveRequest = modelMapper.map(leaveRequestDto, LeaveRequest.class);
        leaveRequest.setEmployee(employee);
        leaveRequest.setManager(manager);
        leaveRequest.setStatus(LeaveRequest.LeaveStatus.PENDING);

        leaveRequest = leaveRequestRepository.save(leaveRequest);
        
        // TODO: Send notification to manager
        sendNotificationToManager(manager, employee, leaveRequest);
        
        return convertToDto(leaveRequest);
    }

    public List<LeaveRequestDto> getPendingLeavesByManager(Long managerId) {
        return leaveRequestRepository.findByManagerIdAndStatus(managerId, LeaveRequest.LeaveStatus.PENDING).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<LeaveRequestDto> getAllPendingLeaves() {
        return leaveRequestRepository.findByStatus(LeaveRequest.LeaveStatus.PENDING).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestDto> getLeavesByEmployee(Long employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public LeaveRequestDto approveLeave(Long leaveId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        
        leaveRequest.setStatus(LeaveRequest.LeaveStatus.APPROVED);
        leaveRequest = leaveRequestRepository.save(leaveRequest);
        
        // TODO: Send notification to employee
        sendNotificationToEmployee(leaveRequest.getEmployee(), leaveRequest, "APPROVED");
        
        return convertToDto(leaveRequest);
    }

    public LeaveRequestDto rejectLeave(Long leaveId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        
        leaveRequest.setStatus(LeaveRequest.LeaveStatus.REJECTED);
        leaveRequest = leaveRequestRepository.save(leaveRequest);
        
        // TODO: Send notification to employee
        sendNotificationToEmployee(leaveRequest.getEmployee(), leaveRequest, "REJECTED");
        
        return convertToDto(leaveRequest);
    }

    public LeaveRequestDto getLeaveById(Long id) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        return convertToDto(leaveRequest);
    }

    public void deleteLeave(Long id) {
        leaveRequestRepository.deleteById(id);
    }

    private LeaveRequestDto convertToDto(LeaveRequest leaveRequest) {
        LeaveRequestDto dto = modelMapper.map(leaveRequest, LeaveRequestDto.class);
        
        if (leaveRequest.getEmployee() != null) {
            dto.setEmployeeId(leaveRequest.getEmployee().getId());
            dto.setEmployeeName(leaveRequest.getEmployee().getFullName());
        }

        if (leaveRequest.getManager() != null) {
            dto.setManagerId(leaveRequest.getManager().getId());
            dto.setManagerName(leaveRequest.getManager().getFullName());
        }

        return dto;
    }

    private void sendNotificationToManager(Employee manager, Employee employee, LeaveRequest leaveRequest) {
        // TODO: Implement email notification or system notification
        System.out.println("Notification sent to manager " + manager.getFullName() + 
                " about leave request from " + employee.getFullName());
    }

    private void sendNotificationToEmployee(Employee employee, LeaveRequest leaveRequest, String status) {
        // TODO: Implement email notification or system notification
        System.out.println("Notification sent to employee " + employee.getFullName() + 
                " about leave request status: " + status);
    }
}