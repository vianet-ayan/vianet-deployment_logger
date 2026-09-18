import { query } from '../main.js'

export const getDaybook = async (limit = 500, offset = 0) => {
  const result = await query(`
    SELECT * FROM app.vouchers
    ORDER BY id ASC
    LIMIT $1 OFFSET $2
  `, [limit, offset])
  return result.rows
}

export const getDaybookCount = async (): Promise<number> => {
  const result = await query(`SELECT COUNT(*) FROM app.vouchers`)
  const countString = result.rows[0].count
  return parseInt(countString, 10)
}
