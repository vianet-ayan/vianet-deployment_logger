import { Redis } from "ioredis";

let _redis: Redis | null = null;

export default function getRedis(): Redis | null {
  if (!process.env.up_REDIS_URL) {
    return null
  }
  if (!_redis) {
    _redis = new Redis(process.env.up_REDIS_URL);
  }
  return _redis;
}