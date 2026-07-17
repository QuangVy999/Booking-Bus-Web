import Redis from 'ioredis';
import 'dotenv/config';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = Number(process.env.REDIS_PORT) || 6380;

export const redis = new Redis({
  host: redisHost,
  port: redisPort
});

redis.on('connect', () => {
  console.log(`Connected to Redis at ${redisHost}:${redisPort}`);
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});
