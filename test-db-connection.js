require('dotenv').config({ path: '.env.local' });
const sql = require('mssql');

const instance = process.env.DB_INSTANCE || undefined;

const config = {
  server: (process.env.DB_HOST || 'localhost').split('\\')[0],
  port: instance ? undefined : (process.env.DB_PORT ? Number(process.env.DB_PORT) : 1433),
  database: process.env.DB_NAME || 'Dawlance_Skills_Matrix',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'Admin@1234',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    instanceName: instance,
    tdsVersion: '7_4',
    packetSize: 4096,
  },
  connectionTimeout: 15000,
  requestTimeout: 15000,
};

console.log('--- Attempting connection with config ---');
console.log({ ...config, password: '***' });
console.log('------------------------------------------');

sql.connect(config)
  .then(async (pool) => {
    console.log('Connected successfully!');
    const result = await pool.request().query('SELECT @@VERSION AS version, DB_NAME() AS db');
    console.log('Server version:', result.recordset[0].version);
    console.log('Connected to database:', result.recordset[0].db);
    await pool.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('Connection FAILED');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    if (err.originalError) {
      console.error('Original error:', err.originalError.message);
    }
    process.exit(1);
  });
