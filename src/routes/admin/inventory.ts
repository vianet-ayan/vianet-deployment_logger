import { getInventory, getInventoryCount } from '../../db/main.js'
import express from 'express'

const router = express.Router()

router.get('/', async (req, res) => {
  // Set headers for chunked JSON streaming
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Transfer-Encoding', 'chunked')

  // Open the JSON array bracket for the stream
  res.write('[')

  const LIMIT = 500 // Batch 500 records at a time
  let offset = 0
  let isFirstItem = true

  try {
    while (true) {
      console.log(`Fetching inventory batch: LIMIT ${LIMIT}, OFFSET ${offset}...`)
      
      // Fetch the batch of rows
      const inventoryRows = await getInventory(LIMIT, offset)

      // If the array is empty, we have reached the end of the table
      if (!inventoryRows || inventoryRows.length === 0) {
        break
      }

      // Build a string chunk for this batch to reduce I/O overhead
      let chunkString = ''
      for (const item of inventoryRows) {
        const prefix = isFirstItem ? '' : ','
        chunkString += prefix + JSON.stringify(item)
        isFirstItem = false
      }

      // Send this batch down the network stream
      res.write(chunkString)

      // Move the offset forward for the next iteration
      offset += LIMIT

      // Safety check: if we got fewer rows than the limit, it's the last page
      if (inventoryRows.length < LIMIT) {
        break
      }
    }

    // Close the JSON array and end the response
    res.write(']')
    return res.end()

  } catch (error) {
    console.error('Error during streaming:', error)

    // If headers haven't gone out yet, send a standard 500 JSON error
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to stream inventory' })
    }

    // If headers were already sent, forcefully close the JSON array with an error flag
    res.write(', {"error": "Stream failed halfway through"}]')
    return res.end()
  }
})

router.get('/count', async (_req, res) => {
  try {
    const count = await getInventoryCount()
    return res.send(String(count))
  } catch (error) {
    console.error('Error fetching inventory count:', error)
    return res.status(500).json({ error: 'Failed to fetch inventory count' })
  }
})

export default router