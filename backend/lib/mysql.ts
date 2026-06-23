import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const instance = process.env.DB_INSTANCE || undefined;

const config: sql.config = {
  server: (process.env.DB_HOST || 'localhost').replace(/\\\\/g, '\\'),
  port: instance ? undefined : (process.env.DB_PORT ? Number(process.env.DB_PORT) : 1433),
  database: process.env.DB_NAME || 'Dawlance_Skills_Matrix',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'Admin@1234',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    instanceName: instance
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let connectionPool: sql.ConnectionPool | null = null;

async function getPool(): Promise<sql.ConnectionPool> {
  if (!connectionPool || !connectionPool.connected) {
    connectionPool = await sql.connect(config);
  }
  return connectionPool;
}

/**
 * Converts MySQL SQL syntax to T-SQL and replaces ? placeholders with @p1, @p2, …
 */
function convertToMssql(mysqlSql: string, params: any[]): { sql: string; params: any[] } {
  let i = 0;

  // Replace ? with @p1, @p2, …
  let converted = mysqlSql.replace(/\?/g, () => `@p${++i}`);

  // NOW() → GETDATE()
  converted = converted.replace(/\bNOW\(\)/gi, 'GETDATE()');

  // DATE_SUB(GETDATE(), INTERVAL @pN DAY) → DATEADD(DAY, -@pN, GETDATE())
  converted = converted.replace(
    /DATE_SUB\s*\(\s*GETDATE\s*\(\s*\)\s*,\s*INTERVAL\s+(@p\d+)\s+DAY\s*\)/gi,
    (_: string, pname: string) => `DATEADD(DAY, -${pname}, GETDATE())`
  );

  // LIMIT 1 (literal) → SELECT TOP 1 … (remove LIMIT 1, add TOP 1 after first SELECT)
  if (/\bLIMIT\s+1\b/i.test(converted)) {
    converted = converted.replace(/\bLIMIT\s+1\b/gi, '');
    // Only replace the very first SELECT to avoid breaking subqueries
    const selectMatch = converted.match(/\bSELECT\b/i);
    if (selectMatch && selectMatch.index !== undefined) {
      converted = 
        converted.slice(0, selectMatch.index) + 
        'SELECT TOP 1 ' + 
        converted.slice(selectMatch.index + selectMatch[0].length);
    }
  }

  // LIMIT @pN → OFFSET 0 ROWS FETCH NEXT @pN ROWS ONLY
  converted = converted.replace(/\bLIMIT\s+(@p\d+)\b/gi, 'OFFSET 0 ROWS FETCH NEXT $1 ROWS ONLY');

  return { sql: converted, params };
}

/**
 * mysql2-compatible query shim.
 * Returns [rows] for SELECT, [{ insertId, affectedRows }] for INSERT,
 * and [{ affectedRows }] for UPDATE/DELETE.
 */
async function query<T = any>(mysqlSql: string, params: any[] = []): Promise<[any, any]> {
  const dbPool = await getPool();
  const request = dbPool.request();

  const { sql: convertedSql, params: convertedParams } = convertToMssql(mysqlSql, params);

  convertedParams.forEach((val, idx) => {
    request.input(`p${idx + 1}`, val === undefined ? null : val);
  });

  const trimmed = convertedSql.trim();
  const isInsert = /^INSERT\s+/i.test(trimmed);
  const isModify = /^(UPDATE|DELETE)\s+/i.test(trimmed);

  let finalSql = convertedSql;
  if (isInsert) {
    finalSql = convertedSql.trimEnd() + ';\nSELECT SCOPE_IDENTITY() AS insertId';
  }

  const result = await request.query(finalSql);

  if (isInsert) {
    // In MSSQL batches, triggers or session settings can shift results to recordsets[1]
    // We check both recordset indices for robustness.
    const insertId = (result.recordsets?.[0]?.[0]?.insertId ?? 
                      result.recordsets?.[1]?.[0]?.insertId) ?? 0;
                      
    return [{ insertId, affectedRows: result.rowsAffected?.[0] ?? 0 }, result];
  }

  if (isModify) {
    return [{ affectedRows: result.rowsAffected?.[0] ?? 0 }, result];
  }

  return [result.recordset ?? [], result];
}

const pool = { query };
export default pool;
