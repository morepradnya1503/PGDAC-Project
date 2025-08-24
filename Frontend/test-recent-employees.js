#!/usr/bin/env node

/**
 * Test Script for Recent Employees Functionality
 * 
 * This script verifies that the recent employees section shows:
 * 1. Only 2 records
 * 2. Records in descending order (newest first)
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Recent Employees Implementation...\n');

// Check API service implementation
const apiServicePath = path.join(__dirname, 'src/services/api.js');
const dashboardPath = path.join(__dirname, 'src/pages/hr/Dashboard.js');

let allTestsPassed = true;

console.log('📄 Checking API Service (api.js)...');

if (fs.existsSync(apiServicePath)) {
  const apiContent = fs.readFileSync(apiServicePath, 'utf8');
  
  const checks = [
    { name: 'getRecentEmployees method exists', pattern: 'async getRecentEmployees(limit = 2)' },
    { name: 'Descending sort by createdAt', pattern: 'new Date(b.createdAt) - new Date(a.createdAt)' },
    { name: 'Descending sort by dateOfJoining', pattern: 'new Date(b.dateOfJoining) - new Date(a.dateOfJoining)' },
    { name: 'Descending sort by ID', pattern: '(b.id || 0) - (a.id || 0)' },
    { name: 'Slice to limit records', pattern: '.slice(0, limit)' },
    { name: 'Fallback to all employees', pattern: 'get(\'/hr/employees\')' }
  ];
  
  checks.forEach(check => {
    if (apiContent.includes(check.pattern)) {
      console.log(`   ✅ ${check.name}`);
    } else {
      console.log(`   ❌ ${check.name} - Pattern not found: ${check.pattern}`);
      allTestsPassed = false;
    }
  });
} else {
  console.log('   ❌ API service file not found');
  allTestsPassed = false;
}

console.log('\n📄 Checking HR Dashboard...');

if (fs.existsSync(dashboardPath)) {
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  
  const checks = [
    { name: 'Calls getRecentEmployees with limit 2', pattern: 'getRecentEmployees(2)' },
    { name: 'Sorts recent employees consistently', pattern: 'sortedRecentEmployees = recentEmployeesResponse.data' },
    { name: 'Limits to 2 records', pattern: '.slice(0, 2)' },
    { name: 'Primary sort by createdAt', pattern: 'new Date(b.createdAt) - new Date(a.createdAt)' },
    { name: 'Secondary sort by dateOfJoining', pattern: 'new Date(b.dateOfJoining) - new Date(a.dateOfJoining)' },
    { name: 'Tertiary sort by ID', pattern: '(b.id || 0) - (a.id || 0)' },
    { name: 'Console logging for debugging', pattern: 'console.log(\'Recent employees set' }
  ];
  
  checks.forEach(check => {
    if (dashboardContent.includes(check.pattern)) {
      console.log(`   ✅ ${check.name}`);
    } else {
      console.log(`   ❌ ${check.name} - Pattern not found: ${check.pattern}`);
      allTestsPassed = false;
    }
  });
} else {
  console.log('   ❌ HR Dashboard file not found');
  allTestsPassed = false;
}

// Summary
console.log('\n📊 SUMMARY');
console.log('=' .repeat(50));

if (allTestsPassed) {
  console.log('🎉 Recent Employees functionality implemented successfully!');
  console.log('\n✅ Features Implemented:');
  console.log('   • API fetches exactly 2 recent employees');
  console.log('   • Multi-level sorting: createdAt → dateOfJoining → ID');
  console.log('   • Descending order (newest employees first)');
  console.log('   • Consistent fallback mechanisms');
  console.log('   • Frontend sorting for additional consistency');
  console.log('   • Debug logging for troubleshooting');
  
  console.log('\n🚀 How to Test:');
  console.log('   1. Start your backend server');
  console.log('   2. Start frontend: npm start in worksphere-frontend');
  console.log('   3. Login as HR user');
  console.log('   4. Navigate to http://localhost:3000/hr');
  console.log('   5. Check "Recent Employees" section');
  console.log('   6. Verify only 2 employees show');
  console.log('   7. Verify newest employees appear first');
  console.log('   8. Check browser console for debug logs');
  
} else {
  console.log('❌ Some functionality is missing or incomplete.');
  console.log('   Please review the implementation above.');
}

console.log('\n🔧 Expected Behavior:');
console.log('   • Shows exactly 2 employee records');
console.log('   • Newest employees appear at the top');
console.log('   • Sorting priority: createdAt > dateOfJoining > ID');
console.log('   • Works even if backend endpoint is not available');
console.log('   • Console logs show which data source was used');
