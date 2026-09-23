import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { smtpService } from '../services/smtp.service';
import { rateLimitService } from '../services/rate-limit.service';
import { idempotencyService } from '../utils/idempotency';
import { esClient } from '../config/elasticsearch';
import { slackService } from '../services/slack.service';

interface EmailJobData {
  emailId: string;
  campaignId: string;
  senderId: string;
}

async function indexEmailInES(emailId: string) {
  try {
    const email = await prisma.email.findUnique({ where: { id: emailId } });
    if (email) {
      await esClient.index({
        index: 'emails',
        id: email.id,
        document: email,
      });
    }
  } catch (err) {
    logger.error({ err }, `Failed to index email ${emailId} in ES`);
  }
}

export const emailWorker = new Worker<EmailJobData>(
  'email-scheduler',
  async (job: Job) => {
    const { emailId, senderId } = job.data;
    
    // 1. Check idempotency lock
    const locked = await idempotencyService.acquireLock(emailId, 120);
    if (!locked) {
      logger.info(`Email ${emailId} is already being processed by another worker.`);
      return;
    }

    try {
      // 2. Load email from DB
      const email = await prisma.email.findUnique({
        where: { id: emailId },
        include: { sender: true },
      });

      if (!email) {
        logger.warn(`Email ${emailId} not found in DB. Skipping.`);
        return;
      }

      // 3. Check status
      if (['sent', 'cancelled', 'processing'].includes(email.status)) {
        logger.info(`Email ${emailId} is in status ${email.status}. Skipping.`);
        return;
      }

      // 4. Rate Limit check
      const allowed = await rateLimitService.checkHourlyLimit(senderId, email.sender.hourlyLimit);
      if (!allowed) {
        logger.warn(`Rate limit reached for sender ${senderId}. Rescheduling email ${emailId}.`);
        
        // Calculate delay for next window (e.g. start of next hour)
        const now = new Date();
        const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
        const delayMs = nextHour.getTime() - now.getTime();

        await prisma.email.update({
          where: { id: emailId },
          data: { status: 'rate_limited' },
        });

        // Slack Notification
        await slackService.sendRateLimitNotification(senderId, email.sender.hourlyLimit);

        // Reschedule job
        await job.moveToDelayed(Date.now() + delayMs, job.token!);
        return;
      }

      // 5. Enforce minimum delay
      const delayCheck = await rateLimitService.enforceMinimumDelay(senderId);
      if (!delayCheck.allowed && delayCheck.waitTimeMs) {
        // Reschedule quickly with the required wait time
        await prisma.email.update({
          where: { id: emailId },
          data: { status: 'scheduled' },
        });
        await job.moveToDelayed(Date.now() + delayCheck.waitTimeMs, job.token!);
        return;
      }

      // 6. Atomic transition to processing
      const transitioned = await idempotencyService.transitionToProcessing(emailId);
      if (!transitioned) {
        logger.info(`Failed to transition email ${emailId} to processing (likely already sent).`);
        return;
      }

      // 7. Send Email
      const result = await smtpService.sendEmail(
        email.recipient,
        email.subject,
        email.body,
        email.sender.email
      );

      // 8. Update DB
      if (result.success) {
        await prisma.email.update({
          where: { id: emailId },
          data: {
            status: 'sent',
            sentAt: new Date(),
            messageId: result.messageId,
            attempts: email.attempts + 1,
          },
        });
        
        await prisma.campaign.update({
          where: { id: email.campaignId },
          data: { sentCount: { increment: 1 } },
        });
        
        logger.info(`Successfully sent email ${emailId}`);
      } else {
        await prisma.email.update({
          where: { id: emailId },
          data: {
            status: 'failed',
            errorMessage: result.error,
            attempts: email.attempts + 1,
          },
        });
        
        await prisma.campaign.update({
          where: { id: email.campaignId },
          data: { failedCount: { increment: 1 } },
        });
        
        throw new Error(result.error); // Re-throw to trigger BullMQ retry
      }

      // 9. Update Elasticsearch
      await indexEmailInES(emailId);

    } finally {
      await idempotencyService.releaseLock(emailId);
    }
  },
  {
    connection: redis,
    concurrency: env.WORKER_CONCURRENCY,
  }
);

emailWorker.on('completed', (job) => {
  logger.info(`Job completed: ${job.id}`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`Job failed: ${job?.id} with error: ${err.message}`);
});
