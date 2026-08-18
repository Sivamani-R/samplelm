import { outboxService } from './outbox.js';

class EventPublisher {
  constructor() {
    this.handlers = {};
  }

  subscribe(eventType, handler) {
    if (!this.handlers[eventType]) {
      this.handlers[eventType] = [];
    }
    this.handlers[eventType].push(handler);
  }

  // Publish synchronous in-memory events (for MVP instead of Kafka)
  async publish(eventType, payload) {
    console.log(`[EventPublisher] Publishing event: ${eventType}`);
    const handlers = this.handlers[eventType] || [];
    for (const handler of handlers) {
      try {
        await handler(payload);
      } catch (err) {
        console.error(`[EventPublisher] Error handling event ${eventType}:`, err);
      }
    }
  }

  // Save event transactionally, to be published later
  async publishTransactionally(client, eventType, payload) {
    await outboxService.saveEvent(client, eventType, payload);
    
    // For MVP, since we don't have a background worker yet, we can trigger the publish asynchronously after the transaction commits.
    // In a real system, a separate worker process would poll the outbox.
    setTimeout(() => {
      this.publish(eventType, payload).catch(console.error);
    }, 100);
  }
}

export const eventPublisher = new EventPublisher();

// Define Event Types
export const EVENT_TYPES = {
  LEAVE_SUBMITTED: 'LEAVE_SUBMITTED',
  LEAVE_APPROVED: 'LEAVE_APPROVED',
  LEAVE_REJECTED: 'LEAVE_REJECTED',
  LEAVE_WITHDRAWN: 'LEAVE_WITHDRAWN',
  LEAVE_CANCELLED: 'LEAVE_CANCELLED',
  LEAVE_ESCALATED: 'LEAVE_ESCALATED',
  CLARIFICATION_REQUESTED: 'CLARIFICATION_REQUESTED',
};
