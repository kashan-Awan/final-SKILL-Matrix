/**
 * MSSQL connection pool for use in Next.js API routes.
 * Uses a non-global ConnectionPool to avoid conflicting with the
 * backend express server which already holds the global sql.connect() pool.
 */
import sql from 'mssql';

function buildConfig(): sql.config {
  return {
    server: (process.env.DB_HOST || 'DESKTOP-D6BPQ37\\SQLEXPRESS01').replace(/\\\\/g, '\\'),
    port: Number(process.env.DB_PORT) || 58525,
    database: process.env.DB_NAME || 'Dawlance_Skil_Matrix',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'Admin@1234',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
}

let pool: sql.ConnectionPool | null = null;

export async function getDb(): Promise<sql.ConnectionPool> {
  if (!pool || !pool.connected) {
    // Use non-global ConnectionPool so we don't conflict with the backend server
    pool = await new sql.ConnectionPool(buildConfig()).connect();
  }
  return pool;
}

// Memoize so we only run the CREATE TABLE check once per process lifetime
let resetTokensTableReady = false;

/**
 * Ensure the password_reset_tokens table exists.
 * Only hits the DB on the first call per process.
 */
export async function ensureResetTokensTable(): Promise<void> {
  if (resetTokensTableReady) return;
  const db = await getDb();
  await db.request().query(`
    IF NOT EXISTS (
      SELECT * FROM sysobjects WHERE name='password_reset_tokens' AND xtype='U'
    )
    CREATE TABLE password_reset_tokens (
      id         INT IDENTITY(1,1) PRIMARY KEY,
      email      NVARCHAR(255) NOT NULL,
      token      NVARCHAR(255) NOT NULL,
      expires_at DATETIME      NOT NULL,
      created_at DATETIME      DEFAULT GETDATE()
    )
  `);
  resetTokensTableReady = true;
}

// Memoize so we only run the ALTER TABLE check once per process lifetime
let userAccountIsActiveReady = false;

/**
 * Ensure useraccount has an is_active column (SQL Server 2016).
 * Safe to call multiple times — only executes the ALTER once per process.
 */
export async function ensureUserAccountIsActive(): Promise<void> {
  if (userAccountIsActiveReady) return;
  const db = await getDb();
  await db.request().query(`
    IF NOT EXISTS (
      SELECT * FROM sys.columns
      WHERE object_id = OBJECT_ID('useraccount') AND name = 'is_active'
    )
    ALTER TABLE useraccount ADD is_active BIT NOT NULL DEFAULT 1
  `);
  userAccountIsActiveReady = true;
}

// Memoize so we only run the CREATE TABLE check once per process lifetime
let pwdChangeRequestsTableReady = false;

/**
 * Ensure the password_change_requests table exists (SQL Server 2016 compatible).
 * Only hits the DB on the first call per process.
 */
export async function ensurePasswordChangeRequestsTable(): Promise<void> {
  if (pwdChangeRequestsTableReady) return;
  const db = await getDb();
  await db.request().query(`
    IF NOT EXISTS (
      SELECT * FROM sysobjects WHERE name='password_change_requests' AND xtype='U'
    )
    CREATE TABLE password_change_requests (
      id                 INT IDENTITY(1,1) PRIMARY KEY,
      user_id            INT            NOT NULL,
      user_name          NVARCHAR(255)  NOT NULL,
      email              NVARCHAR(255)  NOT NULL,
      role               NVARCHAR(50)   NOT NULL,
      new_password_hash  NVARCHAR(255)  NOT NULL,
      status             NVARCHAR(20)   NOT NULL DEFAULT 'pending',
      requested_at       DATETIME       NOT NULL DEFAULT GETDATE(),
      resolved_at        DATETIME       NULL,
      resolved_by        NVARCHAR(255)  NULL
    )
  `);
  pwdChangeRequestsTableReady = true;
}
