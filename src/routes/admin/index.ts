import express from 'express'

const router = express.Router()
/**
 * this router routes for all /api/admin/*
 */

// Home route - HTML
router.get('/test', (req, res) => {
  res.json({ message: 'Test admin route is working!' })
})

export default router