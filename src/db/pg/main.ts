// db.ts
// Pure Postgres connection pool. All caching now lives in src/config/cache.ts.
import pg from 'pg';

const { Pool } = pg;

const neonUrl = process.env.POSTGRES_URL

let neonPool: pg.Pool | null = null

function getPool(): pg.Pool {
  if (!neonUrl) {
    throw new Error('POSTGRES_URL not set')
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

const query = (text: string, params?: any[]) => getPool().query(text, params)

export { query, getPool as neonPool, getPool as neonDb }
