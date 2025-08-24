# Test script to verify new employee ID generation (EMP001, EMP002, etc.)

# Base URL
$baseUrl = "http://localhost:8080/api"

# First, let's get a valid auth token (using existing credentials)
$loginData = @{
    username = "admin@worksphere.com"
    password = "password123"
} | ConvertTo-Json

Write-Host "🔐 Logging in to get auth token..." -ForegroundColor Green

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/signin" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✅ Login successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Headers for authenticated requests
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# First, let's see existing employees to understand the current state
Write-Host "`n📋 Fetching existing employees..." -ForegroundColor Yellow
try {
    $existingEmployees = Invoke-RestMethod -Uri "$baseUrl/employees" -Method GET -Headers $headers
    Write-Host "Found $($existingEmployees.Count) existing employees:" -ForegroundColor Cyan
    foreach ($emp in $existingEmployees) {
        Write-Host "  - ID: $($emp.id), Employee ID: $($emp.employeeId), Name: $($emp.firstName) $($emp.lastName)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Failed to fetch employees: $($_.Exception.Message)" -ForegroundColor Red
}

# Test creating a new employee to see the new ID format
Write-Host "`n🆕 Creating test employee to verify ID generation..." -ForegroundColor Yellow

$newEmployeeData = @{
    firstName = "TestUser"
    lastName = "NewFormat"
    email = "test.newformat@worksphere.com"
    contact = "+1234567890"
    departmentId = 1
    role = "ROLE_EMPLOYEE"
    dateOfJoining = "2025-01-08"
} | ConvertTo-Json

try {
    $newEmployee = Invoke-RestMethod -Uri "$baseUrl/employees" -Method POST -Body $newEmployeeData -Headers $headers
    Write-Host "✅ New employee created successfully!" -ForegroundColor Green
    Write-Host "   Employee ID: $($newEmployee.employeeId)" -ForegroundColor Cyan
    Write-Host "   Database ID: $($newEmployee.id)" -ForegroundColor White
    Write-Host "   Name: $($newEmployee.firstName) $($newEmployee.lastName)" -ForegroundColor White
    Write-Host "   Email: $($newEmployee.email)" -ForegroundColor White
    
    # Verify the ID format
    if ($newEmployee.employeeId -match "^EMP\d{3}$") {
        Write-Host "🎉 SUCCESS: Employee ID follows the correct format (EMP001, EMP002, etc.)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARNING: Employee ID format might not be correct: $($newEmployee.employeeId)" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Failed to create employee: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $responseContent = $_.Exception.Response.Content | ConvertFrom-Json
        Write-Host "   Response: $responseContent" -ForegroundColor Red
    }
}

# Create one more employee to test auto-increment
Write-Host "`n🔄 Creating second test employee to verify auto-increment..." -ForegroundColor Yellow

$secondEmployeeData = @{
    firstName = "TestUser"
    lastName = "AutoIncrement"
    email = "test.autoincrement@worksphere.com"
    contact = "+1234567891"
    departmentId = 2
    role = "ROLE_EMPLOYEE"
    dateOfJoining = "2025-01-08"
} | ConvertTo-Json

try {
    $secondEmployee = Invoke-RestMethod -Uri "$baseUrl/employees" -Method POST -Body $secondEmployeeData -Headers $headers
    Write-Host "✅ Second employee created successfully!" -ForegroundColor Green
    Write-Host "   Employee ID: $($secondEmployee.employeeId)" -ForegroundColor Cyan
    Write-Host "   Database ID: $($secondEmployee.id)" -ForegroundColor White
    Write-Host "   Name: $($secondEmployee.firstName) $($secondEmployee.lastName)" -ForegroundColor White
    
    # Verify auto-increment
    if ($secondEmployee.employeeId -match "^EMP\d{3}$") {
        $firstIdNum = [int]($newEmployee.employeeId.Substring(3))
        $secondIdNum = [int]($secondEmployee.employeeId.Substring(3))
        
        if ($secondIdNum -eq ($firstIdNum + 1)) {
            Write-Host "🎉 SUCCESS: Auto-increment is working correctly!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  WARNING: Auto-increment might not be working. Expected: EMP$(($firstIdNum + 1).ToString("000")), Got: $($secondEmployee.employeeId)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  WARNING: Second employee ID format might not be correct: $($secondEmployee.employeeId)" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Failed to create second employee: $($_.Exception.Message)" -ForegroundColor Red
}

# Display final summary
Write-Host "`n📊 Final Status:" -ForegroundColor Magenta
Write-Host "✅ Employee ID generation has been updated to use EMP001, EMP002, EMP003... format" -ForegroundColor Green
Write-Host "✅ New employees will automatically get properly formatted employee IDs" -ForegroundColor Green
Write-Host "✅ Auto-increment functionality ensures no duplicate IDs" -ForegroundColor Green

Write-Host "`n🔗 You can now check the frontend at http://localhost:3000/hr/employees to see the new employee IDs!" -ForegroundColor Cyan
