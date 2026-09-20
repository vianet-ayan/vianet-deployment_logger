import Redis from "ioredis";
const client = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        return Math.min(times * 100, 3000);
    },
});
client.on("error", (err) => {
    console.error("Redis client error:", err);
});
client.on("connect", () => {
    console.log("Redis connected");
});
export async function get(key) {
    return client.get(key);
}
export async function set(key, value, ttlSeconds) {
    if (ttlSeconds) {
        await client.setex(key, ttlSeconds, value);
    }
    else {
        await client.set(key, value);
    }
}
export async function del(...keys) {
    return client.del(...keys);
}
export async function keys(pattern) {
    return client.keys(pattern);
}
export async function ping() {
    return client.ping();
}
export async function shutdown() {
    await client.quit();
}
export default client;
