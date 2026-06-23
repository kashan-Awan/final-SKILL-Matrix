
import fs from 'fs/promises';
import path from 'path';
import pool from './mysql';

/**
 * Runs the SQL migration from mysql_setup.sql
**/
export default async function seedDatabase() {
  const sqlFilePath = path.join(__dirname, '../mysql_setup.sql');
  try {
    const sqlContent = await fs.readFile(sqlFilePath, 'utf-8');
    // Split on GO statements for MSSQL batch execution
    const statements = sqlContent
      .split(/(?:\r\n|\r|\n)GO(?:\r\n|\r|\n|$)/i) // Split by GO on a new line
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    // Execute each statement using the MSSQL-compatible pool.query method
    for (const stmt of statements) {
      // DDL statements typically don't have parameters, so an empty array is fine.
      await pool.query(stmt, []);
    }
    return { success: true, message: 'SQL migration completed successfully.' };
  } catch (error) {
    console.error('SQL migration failed:', error); // Added for better error visibility
    return { success: false, message: 'SQL migration failed.', error };
  }
}
