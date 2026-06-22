import express from 'express';
import jwt from 'jsonwebtoken';
import { getChats, sendChatMessage, streamChatUpdates, getManagerAiAnalysis } from '../controllers/chatController.js';
const router = express.Router();
router.use((req, res, next) => {
    try { const header = req.headers.authorization || (req.query.token ? `Bearer ${req.query.token}` : ''); if (!header.startsWith('Bearer ')) throw new Error(); req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET); next(); }
    catch { res.status(401).json({ success: false, message: 'Connexion requise.' }); }
});
router.get('/', getChats);
router.get('/stream', streamChatUpdates);
router.get('/manager-analysis', getManagerAiAnalysis);
router.post('/messages', sendChatMessage);
export default router;
