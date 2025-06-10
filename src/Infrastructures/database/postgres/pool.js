/* istanbul ignore file */
const { Pool } = require('pg');

const testConfig = {
  host: process.env.PGHOST_TEST,
  port: process.env.PGPORT_TEST,
  user: process.env.PGUSER_TEST,
  password: process.env.PGPASSWORD_TEST,
  database: process.env.PGDATABASE_TEST,
};

const pool = process.env.NODE_ENV === 'test' ? new Pool(testConfig) : new Pool();

// console.log(
//   `[INFO] Actual Pool Config → host=${pool.options.host} | port=${pool.options.port} | user=${pool.options.user} | database=${pool.options.database}`,
// );

module.exports = pool;
