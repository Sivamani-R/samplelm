import app from './src/app.js';
import { config } from './src/config/env.js';
import { pool } from './src/shared/database/index.js';
import { escalationEngine } from './src/modules/approvals/escalationEngine.js';

const PORT = config.port;

const startServer = async () => {
  try {
    // Check DB connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL successfully');
    client.release();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      
      setInterval(() => {
        escalationEngine.checkAndProcessEscalations().catch(err => {
          console.error('[Scheduler] Escalation engine error:', err);
        });
      }, 60 * 1000);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
