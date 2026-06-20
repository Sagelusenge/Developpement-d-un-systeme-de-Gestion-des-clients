import express from 'express';
import jwt from 'jsonwebtoken';
import { createReclamation, getReclamations, updateReclamation } from '../controllers/reclamationController.js';
const router = express.Router();
router.use((req, res, next) => {
    try {
        const header = req.headers.authorization || '';
        if (!header.startsWith('Bearer ')) throw new Error();
        req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET); next();
    } catch { res.status(401).json({ success: false, message: 'Connexion requise.' }); }
});
router.get('/', getReclamations);
router.post('/', createReclamation);
router.put('/:id', updateReclamation);
export default router;
