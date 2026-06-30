import express from 'express';
import { changeClientPassword, getClientDashboard, getClientMe, loginClient, registerClient, resendClientCode, updateClientProfile, verifyClientEmail } from '../controllers/clientAuthController.js';
import { protectClient } from '../middleware/authMiddleware.js';
import { codeRateLimiter, loginRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();
router.post('/login', loginRateLimiter, loginClient);
router.post('/register', codeRateLimiter, registerClient);
router.post('/verify-email', codeRateLimiter, verifyClientEmail);
router.post('/resend-code', codeRateLimiter, resendClientCode);
router.get('/me', protectClient, getClientMe);
router.get('/dashboard', protectClient, getClientDashboard);
router.put('/profile', protectClient, updateClientProfile);
router.post('/change-password', protectClient, changeClientPassword);
export default router;
