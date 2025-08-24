# WorkSphere EMS API Testing Guide

## Quick Start

### 1. Application URLs
- **Base URL**: `http://localhost:8080/api`
- **Swagger UI**: `http://localhost:8080/api/swagger-ui.html`
- **API Documentation**: `http://localhost:8080/api/v3/api-docs`

### 2. Default Admin Credentials
```
Username: admin
Password: admin123
```

## Testing with Postman

### Step 1: Test Basic Connectivity
```
GET http://localhost:8080/api/health
GET http://localhost:8080/api/ping
GET http://localhost:8080/api/test
```

### Step 2: Test Public Admin Dashboard (No Authentication Required)
```
GET http://localhost:8080/api/admin/dashboard/public
```

### Step 3: Login as Admin
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Step 4: Debug Authentication (After Login)
```
GET http://localhost:8080/api/auth/debug
GET http://localhost:8080/api/auth/me
```

### Step 5: Use JWT Token
Copy the token from login response and add to headers:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### Step 6: Test Protected Admin Dashboard
```
GET http://localhost:8080/api/admin/dashboard
```

## Testing with Swagger UI

### Step 1: Open Swagger UI
Navigate to: `http://localhost:8080/api/swagger-ui.html`

### Step 2: Select Server
In Swagger UI, make sure you select: **"Development server with API context path"**

### Step 3: Test Login
1. Find `/auth/login` endpoint
2. Click "Try it out"
3. Enter credentials:
```json
{
  "username": "admin",
  "password": "admin123"
}
```
4. Click "Execute"

### Step 4: Authorize with JWT
1. Click "Authorize" button at top
2. Enter: `Bearer YOUR_TOKEN_HERE`
3. Click "Authorize"

## Available Endpoints

### Public Endpoints (No Authentication)
- `GET /api/health` - Health check
- `GET /api/ping` - Simple ping
- `GET /api/test` - Test endpoint
- `GET /api/auth/health` - Auth health check
- `POST /api/auth/login` - User login
- `GET /api/admin/dashboard/public` - Public admin dashboard (for testing)

### Protected Endpoints (Require JWT Token)
- `GET /api/auth/debug` - Debug authentication status
- `GET /api/auth/me` - Get current user info
- `GET /api/admin/dashboard` - Admin dashboard (requires ADMIN role)
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `GET /api/employees/{id}` - Get employee by ID
- `PUT /api/employees/{id}` - Update employee
- `DELETE /api/employees/{id}` - Delete employee

## Default Users

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| Admin | `admin` | `admin123` | Full access |
| HR | `hr` | `hr123` | HR functions |
| Manager | `manager` | `manager123` | Manager functions |
| Employee | `employee` | `employee123` | Employee functions |

## Troubleshooting

### 404 Errors
- Make sure you're using `/api` in the URL
- Check if application is running
- Verify port 8080 is available

### 403 Forbidden Errors
1. **Check if you're logged in:**
   ```
   GET http://localhost:8080/api/auth/me
   ```

2. **Debug authentication:**
   ```
   GET http://localhost:8080/api/auth/debug
   ```

3. **Verify JWT token:**
   - Make sure you're using `Bearer ` prefix
   - Check if token is valid and not expired
   - Ensure token contains proper roles

4. **Test public endpoints first:**
   ```
   GET http://localhost:8080/api/admin/dashboard/public
   ```

### Authentication Errors
- Check if JWT token is valid
- Make sure to use `Bearer ` prefix
- Verify token hasn't expired
- Check if user has required roles

### Database Errors
- Ensure MySQL is running
- Check database credentials in application.properties
- Verify database `worksphere_ems` exists

## JWT Token Details
- **Expiration**: 24 hours
- **Algorithm**: HS256
- **Secret**: Configured in application.properties
- **Format**: `Bearer <token>`

## Example cURL Commands

```bash
# Health check
curl -X GET "http://localhost:8080/api/health"

# Login
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get employees (with token)
curl -X GET "http://localhost:8080/api/employees" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
``` 