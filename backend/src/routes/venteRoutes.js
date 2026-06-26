import express from 'express';
import {
    getAllVentes,
    getVenteById,
    createVente,
    updateVente,
    deleteVente
} from '../controllers/venteController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ MANAGER + VENDEUR peuvent voir et créer des ventes
router.get('/',
    protect,
    authorizeRoles('manager', 'vendeur'),
    getAllVentes
);

router.get('/:id',
    protect,
    authorizeRoles('manager', 'vendeur'),
    getVenteById
);

router.post('/',
    protect,
    authorizeRoles('vendeur'),
    createVente
);

router.put('/:id',
    protect,
    authorizeRoles('vendeur'),
    updateVente
);

router.delete('/:id',
    protect,
    authorizeRoles('vendeur'),
    deleteVente
);

export default router;
