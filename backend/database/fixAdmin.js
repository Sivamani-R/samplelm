import bcrypt from 'bcryptjs';
import pg from 'pg';

const pool = new pg.Pool({
  user: 'nexleave',
  host: 'localhost',
  database: 'nexleave_db',
  password: 'nexleave_password',
  port: 5433
});

async function run() {
  const hash = await bcrypt.hash('admin123', 10);
  await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, 'admin@enterprise.com']);
  console.log('Admin password updated');
  pool.end();
}
run();
