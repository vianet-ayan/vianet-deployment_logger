// db.ts
// Pure Postgres connection pool. All caching now lives in src/config/cache.ts.
import pg from 'pg';

const { Pool } = pg;

const neonUrl = process.env.POSTGRES_URL

if (!neonUrl) {
  throw new Error('POSTGRES_URL not set')
}

const neonPool = new Pool({
  connectionString: neonUrl,
  max: 5,
  idleTimeoutMillis: 30000,
})

const neonDb = neonPool

const query = (text: string, params?: any[]) => neonPool.query(text, params)

export { query, neonPool, neonDb }
