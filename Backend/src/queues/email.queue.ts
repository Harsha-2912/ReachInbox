import { Queue } from 'bullmq';
import { redis } from '../config/redis';

export const emailQueue = new Queue('email-scheduler', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
