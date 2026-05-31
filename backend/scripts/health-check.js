#!/usr/bin/env node

/**
 * Database Connection and System Health Check Script
 * Run this script to verify that the entire application is properly connected to the database
 */

const http = require('http');

const endpoints = [
  { name: 'Health Check', url: 'http://localhost:3000/api/health' },
  { name: 'Employees API', url: 'http://localhost:3000/api/employees' },
  { name: 'Departments API', url: 'http://localhost:3000/api/departments' },
  { name: 'Skills API', url: 'http://localhost:3000/api/skills' },
  { name: 'Skills Matrix API', url: 'http://localhost:3000/api/skills-matrix' },
  { name: 'Dashboard Stats API', url: 'http://localhost:3000/api/dashboard/stats' },
  { name: 'Database Seed', url: 'http://localhost:3000/api/seed-database' }
];

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: response.statusCode,
            success: parsed.success,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: response.statusCode,
            success: false,
            error: 'Failed to parse JSON response'
          });
        }
      });
    });

    request.on('error', (error) => {
      reject(error);
    });

    request.setTimeout(5000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function checkSystemHealth() {
  console.log(`${colors.blue}🔍 Dawlance Manufacturing Database System Health Check${colors.reset}\n`);
  console.log(`${colors.yellow}Checking ${endpoints.length} endpoints...${colors.reset}\n`);

  let allHealthy = true;
  const results = [];

  for (const endpoint of endpoints) {
    try {
      console.log(`⏳ Testing ${endpoint.name}...`);
      const result = await makeRequest(endpoint.url);
      
      if (result.status === 200 && result.success) {
        console.log(`${colors.green}✅ ${endpoint.name}: HEALTHY${colors.reset}`);
        results.push({ ...endpoint, status: 'healthy', details: result.data });
      } else {
        console.log(`${colors.red}❌ ${endpoint.name}: FAILED (Status: ${result.status})${colors.reset}`);
        allHealthy = false;
        results.push({ ...endpoint, status: 'failed', error: result.error });
      }
    } catch (error) {
      console.log(`${colors.red}❌ ${endpoint.name}: ERROR - ${error.message}${colors.reset}`);
      allHealthy = false;
      results.push({ ...endpoint, status: 'error', error: error.message });
    }
  }

  console.log(`\n${colors.blue}📊 System Summary${colors.reset}`);
  console.log(`${'='.repeat(50)}`);
  
  if (allHealthy) {
    console.log(`${colors.green}✅ All systems are operational!${colors.reset}`);
    console.log(`${colors.green}✅ Database is connected and responding${colors.reset}`);
    console.log(`${colors.green}✅ All API endpoints are functional${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Some systems need attention${colors.reset}`);
  }

  // Show database statistics if health check was successful
  const healthCheck = results.find(r => r.name === 'Health Check');
  if (healthCheck && healthCheck.status === 'healthy') {
    const stats = healthCheck.details.data;
    console.log(`\n${colors.blue}📈 Database Statistics${colors.reset}`);
    console.log(`   👥 Employees: ${stats.employeeCount}`);
    console.log(`   🏢 Departments: ${stats.departmentCount}`);
    console.log(`   🕒 Last Updated: ${new Date(stats.timestamp).toLocaleString()}`);
  }

  console.log(`\n${colors.yellow}💡 Quick Actions:${colors.reset}`);
  console.log(`   🌐 View Employee Management: http://localhost:3000/employees`);
  console.log(`   🧪 Database Test Page: http://localhost:3000/database-test`);
  console.log(`   📊 Skills Mapping: http://localhost:3000/skills-mapping`);
  console.log(`   🔄 Reseed Database: curl http://localhost:3000/api/seed-database`);

  return allHealthy;
}

// Run the health check
checkSystemHealth()
  .then((healthy) => {
    process.exit(healthy ? 0 : 1);
  })
  .catch((error) => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
