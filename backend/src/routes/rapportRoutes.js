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

router.get('/factures', protect, authorizeRoles('manager', 'caissier'), getFactures);
router.get('/creances', protect, authorizeRoles('manager', 'caissier'), getCreances);
router.get('/stock-inventaire', protect, authorizeRoles('manager', 'magasinier', 'caissier'), getStockInventaire);
router.get('/top-acheteurs', protect, authorizeRoles('manager', 'caissier', 'magasinier'), getTopAcheteurs);
router.get('/historique-client/:id', protect, authorizeRoles('manager', 'caissier'), getHistoriqueClient);
router.get('/bilan', protect, authorizeRoles('manager', 'caissier'), getBilan);
router.get('/journal', protect, authorizeRoles('manager', 'caissier'), getJournal);
router.get('/livre-caisse', protect, authorizeRoles('manager', 'caissier'), getLivreCaisse);

export default router;
