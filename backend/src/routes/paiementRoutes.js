import express from 'express';
import {
    createPaiement,
    getPaiements,
    getRapportCaisse,
    getRepartitionPaiements,
    createStripeCheckoutPayment,
    getStripePaymentStatus,
    createClientMobilePayment,
    getMobilePaymentRequests,
    reviewMobilePayment
} from '../controllers/paiementController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/stripe/checkout', protect, authorizeRoles('client'), createStripeCheckoutPayment);
router.get('/stripe/status/:id', protect, authorizeRoles('client'), getStripePaymentStatus);
router.post('/mobile-money/client', protect, authorizeRoles('client'), createClientMobilePayment);
router.get('/mobile-money/demandes', protect, authorizeRoles('manager', 'vendeur'), getMobilePaymentRequests);
router.put('/mobile-money/demandes/:id', protect, authorizeRoles('vendeur'), reviewMobilePayment);

// ✅ MANAGER + VENDEUR peuvent enregistrer et voir les paiements
router.post('/',
    protect,
    authorizeRoles('vendeur'),
    createPaiement
);

router.get('/',
    protect,
    authorizeRoles('manager', 'vendeur'),
    getPaiements
);

router.get('/rapport-caisse',
    protect,
    authorizeRoles('manager', 'vendeur'),
    getRapportCaisse
);

router.get('/repartition',
    protect,
    authorizeRoles('manager', 'vendeur'),
    getRepartitionPaiements
);

export default router;
