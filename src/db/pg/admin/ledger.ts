import { query } from '../main.js'

export const getLedger = async (limit = 500, offset = 0) => {
  const result = await query(`
    SELECT * FROM app.ledger
    ORDER BY id ASC
    LIMIT $1 OFFSET $2
  `, [limit, offset])
  return result.rows
}

export const getLedgerCount = async (): Promise<number> => {
  const result = await query(`SELECT COUNT(*) FROM app.ledger`)
  const countString = result.rows[0].count
  return parseInt(countString, 10)
}
