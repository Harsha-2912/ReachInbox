import http from 'http';
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

    // The worker is already instantiated in email.worker.ts and started automatically by BullMQ
    logger.info('🚀 BullMQ Worker started');

    // Create a lightweight health-check HTTP server so Render (Web Service) detects an open port
    const port = process.env.PORT || 5000;
    const server = http.createServer((req, res) => {
      if (req.url === '/' || req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'worker', timestamp: new Date().toISOString() }));
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });

    server.listen(port, () => {
      logger.info(`🌐 Worker health check server listening on port ${port}`);
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down worker...');
      server.close();
      await emailWorker.close();
      await prisma.$disconnect();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) {
    logger.error({ err }, 'Failed to start worker');
    process.exit(1);
  }
}

bootstrap();
