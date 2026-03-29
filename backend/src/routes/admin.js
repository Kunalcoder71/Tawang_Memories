import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
const router = express.Router();
router.post('/verify', adminAuth, (_, res) => res.json({ success: true }));
export default router;
