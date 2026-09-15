import express from 'express'
import { getSalesThisMonth } from './../../db/pg/admin/dashboard.js'

const router = express.Router()

router.get('/salesthismonth', async (req, res) => {
  try {
    const sales = await getSalesThisMonth()
    res.json(sales)
  } catch (error) {
    console.error('Error fetching sales this month:', error)
    res.status(500).json({ error: 'Failed to fetch sales data' })
  }
})

export default router
