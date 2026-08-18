import app from './src/app.js';
import { config } from './src/config/env.js';
import { pool } from './src/shared/database/index.js';

const PORT = config.port;

const startServer = async () => {
  try {
    // Check DB connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL successfully');
    client.release();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
