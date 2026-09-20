import express from 'express';
import { testDbDirect, testDbToRedis } from '../../db/test.js';
const router = express.Router();
router.get('/test', async (req, res) => {
    try {
        const result = await testDbToRedis();
        res.json({
            message: 'Test app route is working!',
            ...result
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/db', async (req, res) => {
    try {
        const data = await testDbDirect();
        res.json({ source: 'postgres-direct', data });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
