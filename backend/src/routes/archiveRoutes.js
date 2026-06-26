import express from 'express';
import { createArchiveDocument, getArchiveDocuments } from '../controllers/archiveController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('manager', 'vendeur'), getArchiveDocuments);
router.post('/', protect, authorizeRoles('manager'), createArchiveDocument);

export default router;
