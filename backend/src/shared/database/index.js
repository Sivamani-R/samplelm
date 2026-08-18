import pg from 'pg';
import { config } from '../../config/env.js';

// Parse DATE as string (YYYY-MM-DD) instead of converting to UTC Date
pg.types.setTypeParser(1082, (val) => val);
// Parse NUMERIC / DECIMAL as float instead of string
pg.types.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val)));

const { Pool } = pg;

export const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
};

export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
    console.error(`The last executed query on this client was: ${client.lastQuery}`);
  }, 5000);

  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };
  
  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };
  
  return client;
};
