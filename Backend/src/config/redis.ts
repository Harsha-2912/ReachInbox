import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  tls: env.REDIS_HOST.includes('upstash') ? {} : undefined,
  maxRetriesPerRequest: null,
});

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.on('connect', () => console.log('✅ Connected to Redis'));
