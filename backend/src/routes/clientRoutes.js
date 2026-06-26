import express from 'express';
import {
    getAllClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient
} from '../controllers/clientController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ MANAGER + VENDEUR peuvent voir les clients
router.get('/',
    protect,
    authorizeRoles('manager', 'vendeur'),
    getAllClients
);

router.get('/:id',
    protect,
    authorizeRoles('manager', 'vendeur'),
    getClientById
);

// ✅ MANAGER + VENDEUR peuvent créer un client
router.post('/',
    protect,
    authorizeRoles('manager', 'vendeur'),
    createClient
);

// ✅ Seulement le MANAGER peut modifier/supprimer
router.put('/:id',
    protect,
    authorizeRoles('manager'),
    updateClient
);

router.delete('/:id',
    protect,
    authorizeRoles('manager'),
    deleteClient
);

export default router;