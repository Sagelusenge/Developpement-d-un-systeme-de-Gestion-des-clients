import express from 'express';
import {
    getStats,
    getVentesMensuelles,
    getAlertesStock,
    getProduitsPlusVendus,
    getResultatMensuel
} from '../controllers/dashboardController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Dashboard adapte selon le role connecte.
router.get('/stats',
    protect,
    authorizeRoles('manager', 'vendeur', 'magasinier'),
    getStats
);

router.get('/ventes-mensuelles',
    protect,
    authorizeRoles('manager', 'vendeur'),
    getVentesMensuelles
);

router.get('/alertes-stock',
    protect,
    authorizeRoles('manager', 'magasinier'),
    getAlertesStock
);

router.get('/produits-plus-vendus',
    protect,
    authorizeRoles('manager', 'vendeur', 'magasinier'),
    getProduitsPlusVendus
);

router.get('/resultat-mensuel',
    protect,
    authorizeRoles('manager', 'vendeur'),
    getResultatMensuel
);

export default router;
