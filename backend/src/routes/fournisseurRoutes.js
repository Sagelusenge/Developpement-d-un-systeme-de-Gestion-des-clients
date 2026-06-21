import express from 'express';
import {
    getFournisseurs,
    createFournisseur,
    updateFournisseur,
    deleteFournisseur
} from '../controllers/fournisseurController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('manager', 'magasinier', 'caissier'), getFournisseurs);
router.post('/', protect, authorizeRoles('magasinier'), createFournisseur);
router.put('/:id', protect, authorizeRoles('magasinier'), updateFournisseur);
router.delete('/:id', protect, authorizeRoles('magasinier'), deleteFournisseur);

export default router;
