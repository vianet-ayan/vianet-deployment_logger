import { query } from '../main.js'

export interface PnlMonthlyRow {
  id: number
  month: string
  data: Record<string, unknown>
  created_at: Date
  updated_at: Date
}

export interface BalanceSheetRow {
  id: number
  date: string
  data: Record<string, unknown> | null
  created_at: Date
}

// ---------- Profit & Loss (daily snapshots) ----------

export const getPnlByDate = async (date: string) => {
  const result = await query(
    `SELECT * FROM app.profitloss WHERE date = $1 ORDER BY created_at DESC LIMIT 1`,
    [date]
  )
  return result.rows[0] ?? null
}

export const upsertPnl = async (date: string, data: Record<string, unknown>) => {
  const result = await query(
    `INSERT INTO app.profitloss (date, data)
     VALUES ($1, $2)
     RETURNING *`,
    [date, JSON.stringify(data)]
  )
  return result.rows[0]
}

// ---------- Profit & Loss (monthly) ----------

export const getPnlMonthly = async (month?: string) => {
  if (month) {
    const result = await query(
      `SELECT * FROM app.profitloss_monthly WHERE month = $1 ORDER BY month DESC LIMIT 1`,
      [month]
    )
    return result.rows[0] ?? null
  }
  const result = await query(
    `SELECT * FROM app.profitloss_monthly ORDER BY month DESC`
  )
  return result.rows
}

export const upsertPnlMonthly = async (month: string, data: Record<string, unknown>) => {
  const result = await query(
    `INSERT INTO app.profitloss_monthly (month, data)
     VALUES ($1, $2)
     ON CONFLICT (month) DO UPDATE
       SET data = EXCLUDED.data,
           updated_at = now()
     RETURNING *`,
    [month, JSON.stringify(data)]
  )
  return result.rows[0]
}

// ---------- Balance sheet (monthly snapshot, dated month-end) ----------

export const getBalanceSheets = async (limit = 24) => {
  const result = await query(
    `SELECT * FROM app.balancesheet ORDER BY date DESC LIMIT $1`,
    [limit]
  )
  return result.rows
}

export const getBalanceSheetByDate = async (date: string) => {
  const result = await query(
    `SELECT * FROM app.balancesheet WHERE date = $1 ORDER BY created_at DESC LIMIT 1`,
    [date]
  )
  return result.rows[0] ?? null
}

export const upsertBalanceSheet = async (date: string, data: Record<string, unknown>) => {
  // One snapshot per date: replace existing row for that date
  const result = await query(
    `INSERT INTO app.balancesheet (date, data)
     VALUES ($1, $2)
     ON CONFLICT (date) DO UPDATE
       SET data = EXCLUDED.data
     RETURNING *`,
    [date, JSON.stringify(data)]
  )
  return result.rows[0]
}

export const deleteBalanceSheet = async (id: number) => {
  const result = await query(
    `DELETE FROM app.balancesheet WHERE id = $1 RETURNING id`,
    [id]
  )
  return result.rows[0] ?? null
}
