/**
 * MSSQL connection pool for use in Next.js API routes.
 * Uses a non-global ConnectionPool to avoid conflicting with the
 * backend express server which already holds the global sql.connect() pool.
 */
import sql from 'mssql';

function buildConfig(): sql.config {
  const instance = process.env.DB_INSTANCE || undefined;

  return {
    // If using instanceName, the 'server' field should only be the hostname/IP.
    // We strip any \Instance part from the host string to avoid connection errors in Tedious.
    server: (process.env.DB_HOST || 'localhost').split('\\')[0],
    // If using a named instance, port must be undefined for SQL Browser service to work
    port: instance ? undefined : (process.env.DB_PORT ? Number(process.env.DB_PORT) : 1433),
    database: process.env.DB_NAME || 'Dawlance_Skills_Matrix',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'Admin@1234',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
      instanceName: instance, // Fixed casing: must be instanceName for Tedious
      tdsVersion: '7_4', // Optimized for SQL Server 2016
      packetSize: 4096   // Standard packet size often helpful for stability on older SQL versions
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
}

let pool: sql.ConnectionPool | null = null;
let poolPromise: Promise<sql.ConnectionPool> | null = null;

export async function getDb(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) return pool;
  if (poolPromise) {
    try {
      return await poolPromise;
    } catch {
      poolPromise = null; // Clear cached failure to allow retry
    }
  }

  poolPromise = new sql.ConnectionPool(buildConfig()).connect().then(async (newPool) => {
    // Perform schema initialization on the fresh connection before exposing the pool
    // This ensures tables exist before the first actual query hits the DB
    await Promise.all([
      ensureResetTokensTable(newPool),
      ensureUserColumns(newPool),
      ensurePasswordChangeRequestsTable(newPool)
    ]).catch(err => {
      console.error('Database schema initialization failed:', err);
      throw err; // Fail the connection if schema can't be verified
    });

    pool = newPool;
    return newPool;
  }).catch(err => {
    poolPromise = null;
    throw err;
  });

  return poolPromise;
}

// Memoize so we only run the CREATE TABLE check once per process lifetime
let resetTokensTableReady = false;

/**
 * Ensure the password_reset_tokens table exists.
 * Only hits the DB on the first call per process.
 */
export async function ensureResetTokensTable(db: sql.ConnectionPool): Promise<void> {
  if (resetTokensTableReady) return;
  await db.request().query(`
    IF OBJECT_ID('password_reset_tokens', 'U') IS NULL
    CREATE TABLE password_reset_tokens (
      id         INT IDENTITY(1,1) PRIMARY KEY,
      email      NVARCHAR(255) NOT NULL,
      token      NVARCHAR(255) NOT NULL,
      expiresAt  DATETIME2     NOT NULL,
      createdAt  DATETIME2     DEFAULT GETDATE()
    )
  `);
  resetTokensTableReady = true;
}

// Memoize so we only run the ALTER TABLE check once per process lifetime
let userColumnsReady = false;

/**
 * Ensure dawlance_user has necessary columns (is_active, is_deleted).
 * Safe to call multiple times — only executes the ALTER once per process.
 */
export async function ensureUserColumns(db: sql.ConnectionPool): Promise<void> {
  if (userColumnsReady) return;
  await db.request().query(`
    -- Check isActive (Matches mysql_setup.sql)
    IF NOT EXISTS (
      SELECT * FROM sys.columns
      WHERE object_id = OBJECT_ID('dawlance_user') AND LOWER(name) = 'isactive'
    )
    ALTER TABLE dawlance_user ADD isActive BIT NOT NULL DEFAULT 1;

    -- Check is_deleted
    IF NOT EXISTS (
      SELECT * FROM sys.columns
      WHERE object_id = OBJECT_ID('dawlance_user') AND name = 'is_deleted'
    )
    ALTER TABLE dawlance_user ADD is_deleted BIT NOT NULL DEFAULT 0;
  `);
  userColumnsReady = true;
}

// Memoize so we only run the CREATE TABLE check once per process lifetime
let pwdChangeRequestsTableReady = false;

/**
 * Ensure the password_change_requests table exists (SQL Server 2016 compatible).
 * Only hits the DB on the first call per process.
 */
export async function ensurePasswordChangeRequestsTable(db: sql.ConnectionPool): Promise<void> {
  if (pwdChangeRequestsTableReady) return;
  await db.request().query(`
    IF OBJECT_ID('password_change_requests', 'U') IS NULL
    CREATE TABLE password_change_requests (
      id                 INT IDENTITY(1,1) PRIMARY KEY,
      userId             NVARCHAR(24)   NOT NULL,
      userName           NVARCHAR(255)  NOT NULL,
      email              NVARCHAR(255)  NOT NULL,
      role               NVARCHAR(50)   NOT NULL,
      newPasswordHash    NVARCHAR(255)  NOT NULL,
      status             NVARCHAR(20)   NOT NULL DEFAULT 'pending',
      requestedAt        DATETIME2      NOT NULL DEFAULT GETDATE(),
      resolvedAt         DATETIME2      NULL,
      resolvedBy         NVARCHAR(255)  NULL
    )
  `);
  pwdChangeRequestsTableReady = true;
}
