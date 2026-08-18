import { query } from '../database/index.js';

export class OutboxService {
  /**
   * Save an event to the outbox for background processing.
   * Uses an existing database client to participate in the same transaction.
   */
  async saveEvent(client, eventType, payload) {
    await client.query(
      'INSERT INTO outbox_events (event_type, payload, status) VALUES ($1, $2, $3)',
      [eventType, JSON.stringify(payload), 'PENDING']
    );
  }

  // A background worker will periodically poll and publish to Kafka/EventBus
  async processOutbox() {
    // This is a placeholder for the actual worker logic.
    // It would SELECT * FROM outbox_events WHERE status = 'PENDING' FOR UPDATE SKIP LOCKED
    // Publish to EventBus/Kafka
    // UPDATE outbox_events SET status = 'PUBLISHED' WHERE id = ...
  }
}

export const outboxService = new OutboxService();
