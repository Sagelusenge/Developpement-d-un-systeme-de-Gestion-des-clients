import express from 'express';
import { sendPublicContact, getPublicContacts, getPublicSiteConfig, updatePublicContact } from '../controllers/publicController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/config', getPublicSiteConfig);
router.post('/contact', sendPublicContact);
router.get('/contacts', protect, authorizeRoles('manager'), getPublicContacts);
router.put('/contacts/:id', protect, authorizeRoles('manager'), updatePublicContact);
export default router;
