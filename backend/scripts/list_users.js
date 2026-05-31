// scripts/list_users.js
// Lists all users from the MySQL useraccount table.
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../../.env.local' });

async function listUsers() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dawlance_skills_matrix',
    waitForConnections: true,
    connectionLimit: 5,
  });

  try {
    const [rows] = await pool.query(
      `SELECT ua.id, ua.email, ua.role, e.name, e.employeeId
       FROM useraccount ua
       LEFT JOIN employees e ON ua.employee_id = e.id
       ORDER BY ua.role, ua.email`
    );
    console.table(rows);
  } finally {
    await pool.end();
  }
}

listUsers().catch(console.error);
