import express from 'express';
import { changeClientPassword, getClientMe, loginClient, registerClient, resendClientCode, updateClientProfile, verifyClientEmail } from '../controllers/clientAuthController.js';
import { protectClient } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/login', loginClient);
router.post('/register', registerClient);
router.post('/verify-email', verifyClientEmail);
router.post('/resend-code', resendClientCode);
router.get('/me', protectClient, getClientMe);
router.put('/profile', protectClient, updateClientProfile);
router.post('/change-password', protectClient, changeClientPassword);
export default router;
