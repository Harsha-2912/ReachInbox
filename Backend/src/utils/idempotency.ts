import { redis } from '../config/redis';
import { prisma } from '../config/database';
import { logger } from './logger';

export const idempotencyService = {
  /**
   * Attempts to acquire a distributed lock in Redis for the given email ID.
   */
  async acquireLock(emailId: string, ttlSeconds: number = 60): Promise<boolean> {
    const key = `email-lock:${emailId}`;
    const result = await redis.set(key, 'locked', 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  },

  /**
   * Releases a distributed lock in Redis for the given email ID.
   */
  async releaseLock(emailId: string): Promise<void> {
    const key = `email-lock:${emailId}`;
    await redis.del(key);
  },

  /**
   * Safely transitions the email status to "processing" in the database.
   * Returns true if successful, false if the email was already processed, cancelled, or doesn't exist.
   */
  async transitionToProcessing(emailId: string): Promise<boolean> {
    try {
      const result = await prisma.email.updateMany({
        where: {
          id: emailId,
          status: { in: ['scheduled', 'rate_limited'] }, // Only transition from these states
        },
        data: {
          status: 'processing',
        },
      });
      return result.count > 0;
    } catch (err) {
      logger.error(`Error transitioning email ${emailId} to processing:`, err);
      return false;
    }
  }
};
