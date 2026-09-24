import { app } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './config/database';
import { redis } from './config/redis';
import { esClient } from './config/elasticsearch';

async function bootstrap() {
  try {
    await prisma.$connect();
    logger.info('✅ Connected to MySQL');

    try {
      const esInfo = await esClient.info();
      logger.info(`✅ Connected to Elasticsearch (v${esInfo.version.number})`);
    } catch (e) {
      logger.warn(`⚠️ Could not connect to Elasticsearch: Search functionality will fail.`);
    }
    app.listen(parseInt(env.PORT, 10), '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${env.PORT}`);
    });
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

bootstrap();
