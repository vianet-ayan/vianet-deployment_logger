import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utills/jwt.js';

export function adminlogger(req: Request, _res: Response, next: NextFunction) {
  console.log(`[ADMIN LOGGER] ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
}

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.get('authorization');
  const test = req.get('test')
  console.log('[ADMIN AUTH] authorization:', authHeader)
  console.log('[ADMIN AUTH] test:', test)

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = verifyToken(token)
    console.log('[ADMIN AUTH] token verified:', decoded)
    ;(req as any).user = decoded
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
