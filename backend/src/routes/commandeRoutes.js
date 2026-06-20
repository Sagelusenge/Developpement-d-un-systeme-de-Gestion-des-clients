import express from 'express';
import jwt from 'jsonwebtoken';
import { convertCommande, createCommande, getAchatsClient, getCatalogue, getCommandes, updateCommandeStatus } from '../controllers/commandeController.js';

const router = express.Router();
const protectAny = (req, res, next) => {
    try {
        const header = req.headers.authorization || '';
        if (!header.startsWith('Bearer ')) throw new Error();
        req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
        next();
    } catch { res.status(401).json({ success: false, message: 'Connexion requise.' }); }
};
router.use(protectAny);
router.get('/catalogue', getCatalogue);
router.get('/achats', getAchatsClient);
router.get('/', getCommandes);
router.post('/', createCommande);
router.put('/:id/statut', updateCommandeStatus);
router.post('/:id/convertir', convertCommande);
export default router;
