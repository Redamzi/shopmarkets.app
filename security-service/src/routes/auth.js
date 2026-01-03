const express = require('express');
const { body, validationResult } = require('express-validator');
const verificationService = require('../services/verificationService');
const tokenService = require('../services/tokenService');
const logger = require('../config/logger');

const router = express.Router();

/**
 * POST /auth/send-code
 * Send a verification code via email
 */
router.post(
    '/send-code',
    [
        body('userId').isUUID().withMessage('Valid userId is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('type')
            .optional()
            .isIn(['LOGIN', 'REGISTRATION', 'PASSWORD_RESET', 'EMAIL_CHANGE'])
            .withMessage('Invalid type'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, email, type = 'LOGIN' } = req.body;

        try {
            const result = await verificationService.sendCode(userId, email, type);
            res.json(result);
        } catch (error) {
            logger.error('Send code error', { error: error.message, userId });
            res.status(500).json({ error: 'Failed to send verification code' });
        }
    }
);

/**
 * POST /auth/verify-code
 * Verify a code and return a verification token
 */
router.post(
    '/verify-code',
    [
        body('userId').isUUID().withMessage('Valid userId is required'),
        body('code')
            .isString()
            .isLength({ min: 6, max: 6 })
            .withMessage('Code must be 6 digits'),
        body('type')
            .optional()
            .isIn(['LOGIN', 'REGISTRATION', 'PASSWORD_RESET', 'EMAIL_CHANGE'])
            .withMessage('Invalid type'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, code, type = 'LOGIN' } = req.body;

        try {
            const result = await verificationService.verifyCode(userId, code, type);

            if (result.success) {
                // Generate verification token
                const verifyToken = tokenService.generateVerifyToken(userId);

                res.json({
                    success: true,
                    verifyToken,
                    message: 'Code verified successfully',
                });
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            logger.error('Verify code error', { error: error.message, userId });
            res.status(500).json({ error: 'Failed to verify code' });
        }
    }
);

/**
 * POST /auth/resend-code
 * Resend verification code
 */
router.post(
    '/resend-code',
    [
        body('userId').isUUID().withMessage('Valid userId is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('type')
            .optional()
            .isIn(['LOGIN', 'REGISTRATION', 'PASSWORD_RESET', 'EMAIL_CHANGE'])
            .withMessage('Invalid type'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, email, type = 'LOGIN' } = req.body;

        try {
            // Clean up old codes first
            await verificationService.cleanupOldCodes(userId, type);

            // Send new code
            const result = await verificationService.sendCode(userId, email, type);
            res.json(result);
        } catch (error) {
            logger.error('Resend code error', { error: error.message, userId });
            res.status(500).json({ error: 'Failed to resend verification code' });
        }
    }
);

module.exports = router;
