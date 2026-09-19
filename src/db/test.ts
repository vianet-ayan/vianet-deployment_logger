import { query } from './pg/main.js'
import getRedis from './redisCache/redis.js'

export async function testDbDirect() {
  const result = await query(
    'SELECT id, name, email FROM app.users ORDER BY id LIMIT 10'
  )
  return result.rows
}

export async function testDbToRedis() {
  const CACHE_KEY = 'test:users'
  const CACHE_TTL = 60 // seconds

  // 1. Try to get from Redis first
  const redis = getRedis()
  const cached = redis ? await redis.get(CACHE_KEY) : null
  if (cached) {
    return { source: 'redis', data: JSON.parse(cached) }
  }

  // 2. Fetch from Postgres
  const result = await query(
    'SELECT id, name, email FROM app.users ORDER BY id LIMIT 10'
  )
  const rows = result.rows

  // 3. Store in Redis with TTL (if Redis is available)
  if (redis) {
    await redis.set(CACHE_KEY, JSON.stringify(rows), 'EX', CACHE_TTL)
  }

  return { source: 'postgres', data: rows }
}
