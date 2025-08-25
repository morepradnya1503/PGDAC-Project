# PGDAC-Project #WorkSphere

•	WorkSphere is a full-stack Employee Management System built using React for the frontend and Spring Boot for the backend. 

•	The frontend leverages React-Bootstrap for a responsive UI, React Router for navigation, and Axios for secure API communication with the backend. 

•	The backend is developed using Spring MVC for RESTful APIs, Spring Security with JWT for authentication and role-based access control, Hibernate for ORM, and MySQL for data persistence. 

•	The system offers dedicated dashboards for Admin, HR, Manager, and Employee roles. 

•	Key features include sprint-wise performance feedback, leave application and approval workflows, employee profile management, and team member visibility. 

•	The application ensures secure access through JWT tokens and organizes logic using DTOs, services, and JPA entity relationships. 

•	WorkSphere provides a modern, scalable, and secure solution for managing employee data and workflows in a collaborative enterprise environment.

# WorkSphere Employee Management System (EMS)

A comprehensive Employee Management System backend built with Spring Boot, Spring Security, JWT, Hibernate, and MySQL.

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based authorization (ADMIN, HR, MANAGER, EMPLOYEE)
- Secure endpoints with Spring Security

### 👥 User Roles & Dashboards

#### Admin Dashboard
- View total number of employees, HRs, and projects
- Access to all system data

#### HR Dashboard
- Perform CRUD operations on employees
- Add new employees with details
- Create and manage projects
- Assign employees to projects

#### Manager Dashboard
- View assigned projects
- View employees under each project
- Submit performance feedback for employees
- Manage leave requests (approve/reject)

#### Employee Dashboard
- View/Edit profile with comprehensive details
- Add/Update/Delete skills
- View team members working on same projects
- View performance feedback from managers
- Apply for leave requests
- Download resume and ID card (PDF generation)

### 📊 Performance Management
- Managers can submit feedback for each sprint
- Performance scoring (1-10 scale)
- Feedback history and tracking

### 🏖️ Leave Management
- Employees can apply for different types of leave
- Managers can approve/reject leave requests
- Leave history and status tracking
- Notification system (placeholder)

## 🛠️ Technology Stack

- **Backend**: Spring Boot 3.2.0
- **Security**: Spring Security with JWT
- **ORM**: Hibernate/JPA
- **Database**: MySQL 8.0
- **Build Tool**: Maven
- **Java Version**: 17

## 📋 Prerequisites

- Java 17 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

## 🚀 Quick Start

### 1. Database Setup

Create a MySQL database:
```sql
CREATE DATABASE worksphere_ems;
```

### 2. Configuration

Update `src/main/resources/application.properties` with your database credentials:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. Run the Application

```bash
# Clone the repository
git clone <repository-url>
cd ems

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080/api`

### 4. Sample Data

The application automatically creates sample data on first run:

**Default Users:**
- **Admin**: username: `admin`, password: `admin123`
- **HR**: username: `hr`, password: `hr123`
- **Manager**: username: `manager`, password: `manager123`
- **Employee**: username: `employee`, password: `employee123`

## 📚 API Documentation

### Authentication

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Admin Endpoints

#### Dashboard Stats
```
GET /api/admin/dashboard
Authorization: Bearer <jwt-token>
```

#### Get All Employees
```
GET /api/admin/employees
Authorization: Bearer <jwt-token>
```

#### Get All Projects
```
GET /api/admin/projects
Authorization: Bearer <jwt-token>
```

### HR Endpoints

#### Employee Management
```
GET /api/hr/employees                    # Get all employees
POST /api/hr/employees                   # Create new employee
PUT /api/hr/employees/{id}              # Update employee
DELETE /api/hr/employees/{id}           # Delete employee
```

#### Project Management
```
GET /api/hr/projects                     # Get all projects
POST /api/hr/projects                    # Create new project
PUT /api/hr/projects/{id}               # Update project
DELETE /api/hr/projects/{id}            # Delete project
```

#### Assign Employees to Projects
```
POST /api/hr/projects/{projectId}/assign/{employeeId}
DELETE /api/hr/projects/{projectId}/remove/{employeeId}
```

### Manager Endpoints

#### Project Management
```
GET /api/manager/projects                # Get assigned projects
GET /api/manager/projects/{id}/employees # Get project employees
```

#### Performance Feedback
```
POST /api/manager/feedback               # Submit feedback
GET /api/manager/feedback                # Get submitted feedback
PUT /api/manager/feedback/{id}          # Update feedback
DELETE /api/manager/feedback/{id}       # Delete feedback
```

#### Leave Management
```
GET /api/manager/leaves/pending          # Get pending leaves
PUT /api/manager/leave/approve/{id}     # Approve leave
PUT /api/manager/leave/reject/{id}      # Reject leave
```

### Employee Endpoints

#### Profile Management
```
GET /api/employee/profile                # Get profile
PUT /api/employee/profile                # Update profile
PUT /api/employee/skills                 # Update skills
```

#### Project Information
```
GET /api/employee/projects               # Get assigned projects
GET /api/employee/team-members           # Get team members
```

#### Performance Feedback
```
GET /api/employee/feedback               # Get feedback
GET /api/employee/feedback/sprint/{sprintNumber}
```

#### Leave Management
```
POST /api/employee/leave/apply           # Apply for leave
GET /api/employee/leaves                 # Get leave history
```

## 🗄️ Database Schema

### Core Entities

#### Users
- Authentication and authorization
- Role-based access control

#### Employees
- Personal information
- Professional details
- Manager relationships
- Project assignments

#### Projects
- Project details
- Manager assignment
- Employee assignments

#### PerformanceFeedback
- Sprint-based feedback
- Performance scoring
- Manager-employee relationships

#### LeaveRequest
- Leave application details
- Approval workflow
- Status tracking

## 🔧 Configuration

### JWT Configuration
```properties
jwt.secret=your-secret-key
jwt.expiration=86400000
```

### Database Configuration
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/worksphere_ems
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## 🚧 TODO Features

- [ ] PDF generation for resume and ID card
- [ ] Email notification system
- [ ] File upload for employee photos
- [ ] Advanced search and filtering
- [ ] Reporting and analytics
- [ ] Audit logging
- [ ] API rate limiting
- [ ] Swagger/OpenAPI documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team.

---

**WorkSphere EMS** - Empowering organizations with comprehensive employee management solutions. 
