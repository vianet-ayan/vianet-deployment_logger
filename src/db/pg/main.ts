// db.ts
// Pure Postgres connection pool. All caching now lives in src/config/cache.ts.
import pg from 'pg';

const { Pool } = pg;

const neonUrl = process.env.POSTGRES_URL

let neonPool: pg.Pool | null = null

function getPool(): pg.Pool | null {
  if (!neonUrl) {
    return null
  }
  if (!neonPool) {
    neonPool = new Pool({
      connectionString: neonUrl,
      max: 5,
      idleTimeoutMillis: 30000,
    })
  }
  return neonPool
}

const query = (text: string, params?: any[]) => {
  const pool = getPool()
  if (!pool) {
    throw new Error('POSTGRES_URL not set - database queries disabled')
  }
  return pool.query(text, params)
}

export { query, getPool as neonPool, getPool as neonDb }