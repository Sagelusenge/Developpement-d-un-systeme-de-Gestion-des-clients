import express from 'express';
import { login, getMe, forgotPassword, verifyResetCode, resetPasswordWithCode, changePassword, resetRequestedPassword, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);         // POST /api/auth/login
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPasswordWithCode);
router.get('/me', protect, getMe);    // GET  /api/auth/me
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);
router.post('/reset-request-password', protect, resetRequestedPassword);

export default router;
