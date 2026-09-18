import express from 'express'
import { getDaybook, getDaybookCount } from '@db'

const router = express.Router()

router.get('/', async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Transfer-Encoding', 'chunked')
  res.write('[')

  const LIMIT = 500
  let offset = 0
  let isFirstItem = true

  try {
    while (true) {
      console.log(`Fetching daybook batch: LIMIT ${LIMIT}, OFFSET ${offset}...`)

      const rows = await getDaybook(LIMIT, offset)

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

router.get('/count', async (_req, res) => {
  try {
    const count = await getDaybookCount()
    return res.send(String(count))
  } catch (error) {
    console.error('Error fetching daybook count:', error)
    return res.status(500).json({ error: 'Failed to fetch daybook count' })
  }
})

export default router
