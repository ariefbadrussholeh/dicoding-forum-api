/* istanbul ignore file */
const { Pool } = require('pg');

const isTest = process.env.NODE_ENV === 'test';

const config = {
  host: isTest ? process.env.PGHOST_TEST : process.env.PGHOST,
  port: isTest ? process.env.PGPORT_TEST : process.env.PGPORT,
  user: isTest ? process.env.PGUSER_TEST : process.env.PGUSER,
  password: isTest ? process.env.PGPASSWORD_TEST : process.env.PGPASSWORD,
  database: isTest ? process.env.PGDATABASE_TEST : process.env.PGDATABASE,
};

const pool = new Pool(config);

console.log(
  `[INFO] Actual Pool Config → host=${pool.options.host} | port=${pool.options.port} | user=${pool.options.user} | database=${pool.options.database}`,
);

module.exports = pool;
