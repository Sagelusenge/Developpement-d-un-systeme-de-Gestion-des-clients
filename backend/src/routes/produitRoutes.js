import express from 'express';
import {
    getAllProduits,
    getMouvementsStock,
    createProduit,
    updateProduit,
    deleteProduit,
    approvisionner
} from '../controllers/produitController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Tout le monde peut voir les produits
router.get('/',
    protect,
    authorizeRoles('manager', 'vendeur', 'magasinier'),
    getAllProduits
);

router.get('/mouvements-recents',
    protect,
    authorizeRoles('manager', 'magasinier'),
    getMouvementsStock
);

// ✅ MANAGER + MAGASINIER peuvent créer/modifier/supprimer
router.post('/',
    protect,
    authorizeRoles('magasinier'),
    createProduit
);

router.put('/:id',
    protect,
    authorizeRoles('magasinier'),
    updateProduit
);

router.delete('/:id',
    protect,
    authorizeRoles('magasinier'),
    deleteProduit
);

// ✅ MANAGER + MAGASINIER peuvent approvisionner
router.post('/:id/approvisionner',
    protect,
    authorizeRoles('magasinier'),
    approvisionner
);

export default router;
