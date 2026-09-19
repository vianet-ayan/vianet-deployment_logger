import { Redis } from "ioredis";

let _redis: Redis | null = null;

export default function getRedis(): Redis {
  if (!process.env.up_REDIS_URL) {
    throw new Error('up_REDIS_URL not set')
  }
  if (!_redis) {
    _redis = new Redis(process.env.up_REDIS_URL);
  }
  return _redis;
}
