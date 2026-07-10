const { Pool } = require('pg');
const env = require('./env');

// Lazy connection: the pool doesn't open a socket until the first query runs,
// so the process can still boot (and non-DB routes still respond) even if
// Postgres isn't reachable yet.
const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseSsl ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  // Errors on idle clients (e.g. connection dropped by the server) must be
  // handled here or they crash the whole process.
  console.error('Unexpected error on idle PostgreSQL client', err);
});

async function query(text, params) {
  return pool.query(text, params);
}

/**
 * Run a set of queries inside a single transaction. `fn` receives a client
 * with the same `.query(text, params)` signature as the pool.
 */
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };
