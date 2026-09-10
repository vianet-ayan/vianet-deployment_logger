import { createClient, type RedisClientType } from "redis"

const client: RedisClientType = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
})

client.on("error", (err) => {
  console.error("Redis client error:", err)
})

client.on("connect", () => {
  console.log("Redis connected")
})

export async function connect(): Promise<void> {
  if (!client.isOpen) {
    await client.connect()
  }
}

export async function get(key: string): Promise<string | null> {
  return client.get(key)
}

export async function set(key: string, value: string, ttlSeconds?: number): Promise<void> {
  if (ttlSeconds) {
    await client.setEx(key, ttlSeconds, value)
  } else {
    await client.set(key, value)
  }
}

export async function del(...keys: string[]): Promise<number> {
  return client.del(keys)
}

export async function keys(pattern: string): Promise<string[]> {
  return client.keys(pattern)
}

export async function ping(): Promise<string> {
  return client.ping()
}

export async function shutdown(): Promise<void> {
  if (client.isOpen) {
    await client.quit()
  }
}

export default client
