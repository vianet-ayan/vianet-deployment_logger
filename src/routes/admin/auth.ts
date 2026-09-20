import express from 'express';
import { hashPassword, verifyPassword } from '../../utills/password.js';
import { generateToken, verifyToken } from '../../utills/jwt.js';
import { getAdminAccount } from '../../db/main.js';


const router = express.Router();

router.use(express.json());

router.get('/', (_req, res) => {
  res.json({ route: 'auth', status: 'working' });
});

router.post('/', async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const hashedPassword = await hashPassword(password);

  res.status(200).json({
    name: name || null,
    email,
    password: hashedPassword,
  });
});

router.post('/verify', async (req, res) => {
  const { password, hash } = req.body || {};

  if (!password || !hash) {
    res.status(400).json({ error: 'password and hash are required' });
    return;
  }

  const isMatch = await verifyPassword(password, hash);

  res.status(200).json({ verified: isMatch });
});

router.post('/email', async (req, res) => {
  const { email } = req.body
  if (!email) {
    res.status(400).json({ error: 'email is required' })
    return
  }
  const result = await getAdminAccount(email)
  if (!result) {
    res.status(404).json({ error: 'Admin account not found' })
    return
  }
  res.json(result)
})

router.post('/jwt', async (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' })
    return
  }

  const account = await getAdminAccount(email)
  if (!account) {
    res.status(404).json({ error: 'Account not found' })
    return
  }

  const valid = await verifyPassword(password, account.password)
  if (!valid) {
    res.status(401).json({ error: 'Invalid password' })
    return
  }

  const token = generateToken({ email: account.email, name: account.name })

  res.status(200).json({ token, name: account.name, email: account.email })
})

router.post('/verify-jwt', (req, res) => {
  const { token } = req.body || {}

  if (!token) {
    res.status(400).json({ error: 'token is required' })
    return
  }

  try {
    const decoded = verifyToken(token)
    res.status(200).json({ valid: true, data: decoded })
  } catch (err) {
    res.status(401).json({ valid: false, error: 'Invalid or expired token' })
  }
})

export default router;
