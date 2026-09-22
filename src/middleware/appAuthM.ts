import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utills/jwt.js';

export function appLogger(req: Request, _res: Response, next: NextFunction) {
  console.log(`[APP LOGGER] ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
}

export function appAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = verifyToken(token)
    ;(req as any).user = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
