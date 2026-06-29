import express from 'express';
import { getEntreprise, updateEntreprise } from '../controllers/entrepriseController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('manager'), getEntreprise);
router.put('/', protect, authorizeRoles('manager'), updateEntreprise);

export default router;
