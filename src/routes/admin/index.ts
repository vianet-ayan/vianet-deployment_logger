import express from 'express'
import { getAllUsers, getUserById, updateUser } from './../../db/pg/users.js'
import dashboardRouter from './dashboard.js'


const router = express.Router()
/**
 * this router routes for all /api/admin/*
 */
router.use('/dashboard', dashboardRouter)

// Home route - HTML
router.get('/test', (req, res) => {
  res.json({ message: 'Test admin route is working!' })
})

// Fetch all users
router.get('/users', async (req, res) => {
  try {
    const users = await getAllUsers()
    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Fetch user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' })
    }
    const user = await getUserById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' })
    }
    const { name, email, user_type, is_active, access_group_id } = req.body
    const user = await updateUser(id, { name, email, user_type, is_active, access_group_id })
    if (!user) {
      return res.status(404).json({ error: 'User not found or no changes made' })
    }
    res.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

export default router