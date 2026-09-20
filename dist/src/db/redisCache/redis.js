import { Redis } from "ioredis";
let _redis = null;
export default function getRedis() {
    if (!process.env.up_REDIS_URL) {
        return null;
    }
    if (!_redis) {
        _redis = new Redis(process.env.up_REDIS_URL);
    }
    return _redis;
}
