import { verifyToken } from '../utills/jwt.js';
export function adminlogger(req, _res, next) {
    console.log(`[ADMIN LOGGER] ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
    next();
}
export function adminAuth(req, res, next) {
    const authHeader = req.get('authorization');
    const test = req.get('test');
    console.log('[ADMIN AUTH] authorization:', authHeader);
    console.log('[ADMIN AUTH] test:', test);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid Authorization header' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyToken(token);
        console.log('[ADMIN AUTH] token verified:', decoded);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
