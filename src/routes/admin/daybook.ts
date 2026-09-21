import express from 'express'
import { getDaybookCurrentMonth, getDaybookCurrentMonthCount, getAllDaybook, getAllDaybookCount, getDaybookByDateRange, getDaybookByDateRangeCount } from '../../db/main.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const { from, to } = req.query as { from?: string; to?: string }

  if (from && to) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return res.status(400).json({ error: 'Dates must be in YYYY-MM-DD format' })
    }
    if (new Date(from) > new Date(to)) {
      return res.status(400).json({ error: '"from" must be before or equal to "to"' })
    }
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Transfer-Encoding', 'chunked')
  res.write('[')

  const LIMIT = 500
  let offset = 0
  let isFirstItem = true

  try {
    while (true) {
      const rows = from && to
        ? await getDaybookByDateRange(from, to, LIMIT, offset)
        : await getDaybookCurrentMonth(LIMIT, offset)

      if (!rows || rows.length === 0) break

      let chunkString = ''
      for (const item of rows) {
        const prefix = isFirstItem ? '' : ','
        chunkString += prefix + JSON.stringify(item)
        isFirstItem = false
      }

      res.write(chunkString)
      offset += LIMIT

      if (rows.length < LIMIT) break
    }

    res.write(']')
    return res.end()
  } catch (error) {
    console.error('Error during daybook streaming:', error)

    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to stream daybook' })
    }

    res.write(', {"error": "Stream failed halfway through"}]')
    return res.end()
  }
})

router.get('/all', async (_req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Transfer-Encoding', 'chunked')
  res.write('[')

  const LIMIT = 500
  let offset = 0
  let isFirstItem = true

  try {
    while (true) {
      const rows = await getAllDaybook(LIMIT, offset)

      if (!rows || rows.length === 0) break

      let chunkString = ''
      for (const item of rows) {
        const prefix = isFirstItem ? '' : ','
        chunkString += prefix + JSON.stringify(item)
        isFirstItem = false
      }

      res.write(chunkString)
      offset += LIMIT

      if (rows.length < LIMIT) break
    }

    res.write(']')
    return res.end()
  } catch (error) {
    console.error('Error during daybook all streaming:', error)

    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to stream daybook' })
    }

    res.write(', {"error": "Stream failed halfway through"}]')
    return res.end()
  }
})

router.get('/count', async (req, res) => {
  const { from, to } = req.query as { from?: string; to?: string }

  try {
    const count = from && to
      ? await getDaybookByDateRangeCount(from, to)
      : await getDaybookCurrentMonthCount()
    return res.send(String(count))
  } catch (error) {
    console.error('Error fetching daybook count:', error)
    return res.status(500).json({ error: 'Failed to fetch daybook count' })
  }
})

router.get('/all/count', async (_req, res) => {
  try {
    const count = await getAllDaybookCount()
    return res.send(String(count))
  } catch (error) {
    console.error('Error fetching daybook all count:', error)
    return res.status(500).json({ error: 'Failed to fetch daybook count' })
  }
})

router.get('/range', async (req, res) => {
  const { from, to } = req.query as { from?: string; to?: string }

  if (!from || !to) {
    return res.status(400).json({ error: 'Query params "from" and "to" are required (YYYY-MM-DD)' })
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return res.status(400).json({ error: 'Dates must be in YYYY-MM-DD format' })
  }

  if (new Date(from) > new Date(to)) {
    return res.status(400).json({ error: '"from" must be before or equal to "to"' })
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Transfer-Encoding', 'chunked')
  res.write('[')

  const LIMIT = 500
  let offset = 0
  let isFirstItem = true

  try {
    while (true) {
      const rows = await getDaybookByDateRange(from, to, LIMIT, offset)

      if (!rows || rows.length === 0) break

      let chunkString = ''
      for (const item of rows) {
        const prefix = isFirstItem ? '' : ','
        chunkString += prefix + JSON.stringify(item)
        isFirstItem = false
      }

      res.write(chunkString)
      offset += LIMIT

      if (rows.length < LIMIT) break
    }

    res.write(']')
    return res.end()
  } catch (error) {
    console.error('Error during daybook range streaming:', error)

    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to stream daybook range' })
    }

    res.write(', {"error": "Stream failed halfway through"}]')
    return res.end()
  }
})

router.get('/range/count', async (req, res) => {
  const { from, to } = req.query as { from?: string; to?: string }

  if (!from || !to) {
    return res.status(400).json({ error: 'Query params "from" and "to" are required (YYYY-MM-DD)' })
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return res.status(400).json({ error: 'Dates must be in YYYY-MM-DD format' })
  }

  if (new Date(from) > new Date(to)) {
    return res.status(400).json({ error: '"from" must be before or equal to "to"' })
  }

  try {
    const count = await getDaybookByDateRangeCount(from, to)
    return res.send(String(count))
  } catch (error) {
    console.error('Error fetching daybook range count:', error)
    return res.status(500).json({ error: 'Failed to fetch daybook range count' })
  }
})

export default router
