import Redis from "ioredis";

if (!process.env.up_REDIS_URL) {
  throw new Error('up_REDIS_URL not set')
}

const redis = new Redis(process.env.up_REDIS_URL);
console.log('Redis connected to', process.env.up_REDIS_URL);

export default redis;
