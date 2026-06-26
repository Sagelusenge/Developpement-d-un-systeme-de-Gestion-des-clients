import express from 'express';
import {
    getFactures,
    getCreances,
    getStockInventaire,
    getTopAcheteurs,
    getHistoriqueClient,
    getBilan,
    getJournal,
    getLivreCaisse
} from '../controllers/rapportController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/factures', protect, authorizeRoles('manager', 'vendeur'), getFactures);
router.get('/creances', protect, authorizeRoles('manager', 'vendeur'), getCreances);
router.get('/stock-inventaire', protect, authorizeRoles('manager', 'magasinier', 'vendeur'), getStockInventaire);
router.get('/top-acheteurs', protect, authorizeRoles('manager', 'vendeur', 'magasinier'), getTopAcheteurs);
router.get('/historique-client/:id', protect, authorizeRoles('manager', 'vendeur'), getHistoriqueClient);
router.get('/bilan', protect, authorizeRoles('manager', 'vendeur'), getBilan);
router.get('/journal', protect, authorizeRoles('manager', 'vendeur'), getJournal);
router.get('/livre-caisse', protect, authorizeRoles('manager', 'vendeur'), getLivreCaisse);

export default router;
