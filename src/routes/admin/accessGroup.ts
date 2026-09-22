import express from 'express'
import {getAllAccessGroups, getInventoryByAccessGroup, getInventoryByAccessGroupCount} from '../../db/main.js'
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const result = await getAllAccessGroups()
    res.json(result)
  } catch (error) {
    console.error('Error fetching sales this month:', error)
    res.status(500).json({ error: 'Failed to fetch sales data' })
  }
})

// GET /api/admin/access-group/inventory?id=5[&limit=500&offset=0]
// Returns all inventory joined to the access group via app.inventory_access_group
router.get('/inventory', async (req, res) => {
  const id = parseInt(req.query.id as string, 10)
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Query param "id" (access group id) is required and must be a number' })
  }

  const limit = Math.min(parseInt(req.query.limit as string, 10) || 500, 5000)
  const offset = parseInt(req.query.offset as string, 10) || 0

  try {
    const [rows, count] = await Promise.all([
      getInventoryByAccessGroup(id, limit, offset),
      getInventoryByAccessGroupCount(id),
    ])
    return res.json({ accessGroupId: id, count, limit, offset, data: rows })
  } catch (error) {
    console.error('Error fetching inventory for access group:', error)
    return res.status(500).json({ error: 'Failed to fetch inventory for access group' })
  }
})

export default router
