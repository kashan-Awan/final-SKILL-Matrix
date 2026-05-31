
import fs from 'fs/promises';
import path from 'path';
import pool from './mysql';

/**
 * Runs the SQL migration from mysql_setup.sql
**/
export default async function seedDatabase() {
  const sqlFilePath = path.join(__dirname, '../mysql_setup.sql');
  try {
    const sql = await fs.readFile(sqlFilePath, 'utf-8');
    // Split on semicolon followed by newline to avoid issues with inline comments
    const statements = sql
      .split(/;\s*\n/)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    const conn = await pool.getConnection();
    try {
      for (const stmt of statements) {
        await conn.query(stmt);
      }
      return { success: true, message: 'SQL migration completed successfully.' };
    } finally {
      conn.release();
    }
  } catch (error) {
    return { success: false, message: 'SQL migration failed.', error };
  }
}



