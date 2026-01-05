import express from 'express';
import { register, login, verify2FA, verifyEmail, requestPasswordReset, resetPassword, signAVV } from '../controllers/authController.js';
import { validateRegister, validateLogin, validate2FA, validatePasswordReset } from '../middleware/validation.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', rateLimiter, validateRegister, register);
router.post('/login', rateLimiter, validateLogin, login);
router.post('/verify-2fa', rateLimiter, validate2FA, verify2FA);
router.post('/verify-email', validateRegister, verifyEmail);
router.post('/request-password-reset', rateLimiter, requestPasswordReset);
router.post('/reset-password', rateLimiter, validatePasswordReset, resetPassword);

// Protected routes
router.post('/sign-avv', authenticateToken, signAVV);

export default router;
