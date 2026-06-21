import express from 'express';
import jwt from 'jsonwebtoken';
import { getChats, sendChatMessage } from '../controllers/chatController.js';
const router = express.Router();
router.use((req, res, next) => {
    try { const header = req.headers.authorization || ''; if (!header.startsWith('Bearer ')) throw new Error(); req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET); next(); }
    catch { res.status(401).json({ success: false, message: 'Connexion requise.' }); }
});
router.get('/', getChats);
router.post('/messages', sendChatMessage);
export default router;
