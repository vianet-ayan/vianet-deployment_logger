import express from 'express'

const router = express.Router()

// Home route - HTML
router.get('/test', (req, res) => {
  res.json({ message: 'Test app route is working!' })
})

export default router