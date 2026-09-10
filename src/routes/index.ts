import express from 'express'
import appRouter from './app/index.js'
import adminRouter from './admin/index.js'

const router = express.Router()
router.use('/app', appRouter)
router.use('/admin', adminRouter)

// Home route - HTML
router.get('/test', (req, res) => {
  res.json({ message: 'Test route is working!' })
})

export default router