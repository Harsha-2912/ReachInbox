import { emailWorker } from './queues/email.worker';
import { prisma } from './config/database';
import { logger } from './utils/logger';
import { esClient } from './config/elasticsearch';

async function bootstrap() {
  try {
    await prisma.$connect();
    logger.info('✅ Worker connected to MySQL');

    try {
      const esInfo = await esClient.info();
      logger.info(`✅ Worker connected to Elasticsearch (v${esInfo.version.number})`);
    } catch (e) {
      logger.warn(`⚠️ Worker could not connect to Elasticsearch: Indexing will fail silently.`);
    }

    // The worker is already instanciated in email.worker.ts and started automatically by BullMQ
    logger.info('🚀 BullMQ Worker started');

    // Handle graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down worker...');
      await emailWorker.close();
      await prisma.$disconnect();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) {
    logger.error('Failed to start worker:', err);
    process.exit(1);
  }
}

bootstrap();
