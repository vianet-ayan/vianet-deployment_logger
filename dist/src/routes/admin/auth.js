import express from 'express';
const router = express.Router();
// Apply express.json() ONLY to this router
router.use(express.json());
router.get('/', async (req, res) => {
    res.json({ 'route works': 'hello' });
});
router.post('/', async (req, res) => {
    const { name, email, password } = req.body || {};
    res.status(200).json({
        name,
        email,
        password
    });
});
export default router;
