import { query } from '../main.js'

export const getDaybookCurrentMonth = async (limit = 500, offset = 0) => {
  const result = await query(`
    SELECT * FROM app.vouchers
    WHERE date >= date_trunc('month', CURRENT_DATE)
      AND date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
    ORDER BY id ASC
    LIMIT $1 OFFSET $2
  `, [limit, offset])
  return result.rows
}

export const getDaybookCurrentMonthCount = async (): Promise<number> => {
  const result = await query(`
    SELECT COUNT(*) FROM app.vouchers
    WHERE date >= date_trunc('month', CURRENT_DATE)
      AND date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
  `)
  const countString = result.rows[0].count
  return parseInt(countString, 10)
}

export const getAllDaybook = async (limit = 500, offset = 0) => {
  const result = await query(`
    SELECT * FROM app.vouchers
    ORDER BY id ASC
    LIMIT $1 OFFSET $2
  `, [limit, offset])
  return result.rows
}

export const getAllDaybookCount = async (): Promise<number> => {
  const result = await query(`SELECT COUNT(*) FROM app.vouchers`)
  const countString = result.rows[0].count
  return parseInt(countString, 10)
}

export const getDaybookByDateRange = async (fromDate: string, toDate: string, limit = 500, offset = 0) => {
  const result = await query(`
    SELECT * FROM app.vouchers
    WHERE date >= $1 AND date <= $2
    ORDER BY id ASC
    LIMIT $3 OFFSET $4
  `, [fromDate, toDate, limit, offset])
  return result.rows
}

export const getDaybookByDateRangeCount = async (fromDate: string, toDate: string): Promise<number> => {
  const result = await query(`
    SELECT COUNT(*) FROM app.vouchers
    WHERE date >= $1 AND date <= $2
  `, [fromDate, toDate])
  const countString = result.rows[0].count
  return parseInt(countString, 10)
}
