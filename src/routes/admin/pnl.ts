import express from 'express'
import {
  getPnlByDate,
  upsertPnl,
  getPnlMonthly,
  upsertPnlMonthly,
  getBalanceSheets,
  getBalanceSheetByDate,
  upsertBalanceSheet,
  deleteBalanceSheet,
} from '../../db/main.js'

const router = express.Router()

const YYYY_MM_DD = /^\d{4}-\d{2}-\d{2}$/
// month key: "YYYY-MM" (also accepts "YYYY-MM-DD" and normalizes it)
const toMonthKey = (m: string) => m.slice(0, 7)
const YYYY_MM = /^\d{4}-\d{2}$/

// ---------- Profit & Loss ----------

// GET /api/admin/pnl?date=YYYY-MM-DD        -> latest snapshot for that date
// GET /api/admin/pnl                        -> all monthly PnL rows
router.get('/', async (req, res) => {
  const { date } = req.query as { date?: string }

  try {
    if (date) {
      if (!YYYY_MM_DD.test(date)) {
        return res.status(400).json({ error: 'date must be YYYY-MM-DD' })
      }
      const row = await getPnlByDate(date)
      if (!row) return res.status(404).json({ error: 'No PnL snapshot for that date' })
      return res.json(row)
    }
    const rows = await getPnlMonthly()
    return res.json(rows)
  } catch (error) {
    console.error('Error fetching pnl:', error)
    return res.status(500).json({ error: 'Failed to fetch pnl' })
  }
})

// POST /api/admin/pnl  { date: "YYYY-MM-DD", data: {...} }
router.post('/', async (req, res) => {
  const { date, data } = req.body as { date?: string; data?: Record<string, unknown> }

  if (!date || !YYYY_MM_DD.test(date)) {
    return res.status(400).json({ error: 'body.date must be YYYY-MM-DD' })
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ error: 'body.data must be a JSON object' })
  }

  try {
    const row = await upsertPnl(date, data)
    return res.status(201).json(row)
  } catch (error) {
    console.error('Error saving pnl:', error)
    return res.status(500).json({ error: 'Failed to save pnl' })
  }
})

// ---------- Profit & Loss monthly ----------

// GET /api/admin/pnl/monthly                -> all months (desc)
// GET /api/admin/pnl/monthly?month=YYYY-MM  -> single month
router.get('/monthly', async (req, res) => {
  const { month } = req.query as { month?: string }

  try {
    if (month) {
      const key = toMonthKey(month)
      if (!YYYY_MM.test(key)) {
        return res.status(400).json({ error: 'month must be YYYY-MM' })
      }
      const row = await getPnlMonthly(key)
      if (!row) return res.status(404).json({ error: 'No PnL for that month' })
      return res.json(row)
    }
    const rows = await getPnlMonthly()
    return res.json(rows)
  } catch (error) {
    console.error('Error fetching pnl monthly:', error)
    return res.status(500).json({ error: 'Failed to fetch pnl monthly' })
  }
})

// POST /api/admin/pnl/monthly  { month: "YYYY-MM", data: {...} }
router.post('/monthly', async (req, res) => {
  const { month, data } = req.body as { month?: string; data?: Record<string, unknown> }

  if (!month || !YYYY_MM.test(toMonthKey(month))) {
    return res.status(400).json({ error: 'body.month must be YYYY-MM' })
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ error: 'body.data must be a JSON object' })
  }

  try {
    const row = await upsertPnlMonthly(toMonthKey(month), data)
    return res.status(201).json(row)
  } catch (error) {
    console.error('Error saving pnl monthly:', error)
    return res.status(500).json({ error: 'Failed to save pnl monthly' })
  }
})

// ---------- Balance sheet ----------

// GET /api/admin/pnl/balance-sheet                 -> recent snapshots (desc, limit 24)
// GET /api/admin/pnl/balance-sheet?date=YYYY-MM-DD -> single snapshot
router.get('/balance-sheet', async (req, res) => {
  const { date } = req.query as { date?: string }

  try {
    if (date) {
      if (!YYYY_MM_DD.test(date)) {
        return res.status(400).json({ error: 'date must be YYYY-MM-DD' })
      }
      const row = await getBalanceSheetByDate(date)
      if (!row) return res.status(404).json({ error: 'No balance sheet for that date' })
      return res.json(row)
    }
    const rows = await getBalanceSheets()
    return res.json(rows)
  } catch (error) {
    console.error('Error fetching balance sheet:', error)
    return res.status(500).json({ error: 'Failed to fetch balance sheet' })
  }
})

// POST /api/admin/pnl/balance-sheet  { date: "YYYY-MM-DD", data: {...} }
router.post('/balance-sheet', async (req, res) => {
  const { date, data } = req.body as { date?: string; data?: Record<string, unknown> }

  if (!date || !YYYY_MM_DD.test(date)) {
    return res.status(400).json({ error: 'body.date must be YYYY-MM-DD' })
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ error: 'body.data must be a JSON object' })
  }

  try {
    const row = await upsertBalanceSheet(date, data)
    return res.status(201).json(row)
  } catch (error) {
    console.error('Error saving balance sheet:', error)
    return res.status(500).json({ error: 'Failed to save balance sheet' })
  }
})

// DELETE /api/admin/pnl/balance-sheet/:id
router.delete('/balance-sheet/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id' })
  }

  try {
    const row = await deleteBalanceSheet(id)
    if (!row) return res.status(404).json({ error: 'Balance sheet not found' })
    return res.json({ deleted: row.id })
  } catch (error) {
    console.error('Error deleting balance sheet:', error)
    return res.status(500).json({ error: 'Failed to delete balance sheet' })
  }
})

export default router
