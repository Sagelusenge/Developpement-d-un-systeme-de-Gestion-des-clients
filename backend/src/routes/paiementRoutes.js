import express from 'express';
import { 
    createPaiement, 
    getRapportCaisse,
    getRepartitionPaiements,
    createClientMobilePayment,
    getMobilePaymentRequests,
    reviewMobilePayment
} from '../controllers/paiementController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/mobile-money/client', protect, authorizeRoles('client'), createClientMobilePayment);
router.get('/mobile-money/demandes', protect, authorizeRoles('manager', 'caissier'), getMobilePaymentRequests);
router.put('/mobile-money/demandes/:id', protect, authorizeRoles('caissier'), reviewMobilePayment);

// ✅ MANAGER + CAISSIER peuvent enregistrer et voir les paiements
router.post('/',              
    protect, 
    authorizeRoles('caissier'),
    createPaiement
);

router.get('/rapport-caisse', 
    protect, 
    authorizeRoles('manager', 'caissier'), 
    getRapportCaisse
);

router.get('/repartition', 
    protect, 
    authorizeRoles('manager', 'caissier'), 
    getRepartitionPaiements
);

export default router;
