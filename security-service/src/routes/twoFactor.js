const express = require('express');
const { body, validationResult } = require('express-validator');
const totpService = require('../services/totpService');
const tokenService = require('../services/tokenService');
const mailService = require('../services/mailService');
const db = require('../config/database');
const logger = require('../config/logger');

const router = express.Router();

/**
 * POST /2fa/setup
 * Generate TOTP secret and QR code for 2FA setup
 */
router.post(
    '/setup',
    [body('userId').isUUID().withMessage('Valid userId is required')],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId } = req.body;

        try {
            // Generate secret
            const { secret, otpauthUrl } = totpService.generateSecret(userId);

            // Generate QR code
            const qrCode = await totpService.generateQRCode(otpauthUrl);

            // Generate backup codes
            const backupCodes = totpService.generateBackupCodes(10);

            res.json({
                success: true,
                secret,
                qrCode,
                backupCodes,
                message: 'Scan the QR code with your authenticator app',
            });
        } catch (error) {
            logger.error('2FA setup error', { error: error.message, userId });
            res.status(500).json({ error: 'Failed to setup 2FA' });
        }
    }
);

/**
 * POST /2fa/activate
 * Activate 2FA after user confirms with a token
 */
router.post(
    '/activate',
    [
        body('userId').isUUID().withMessage('Valid userId is required'),
        body('secret').isString().withMessage('Secret is required'),
        body('token')
            .isString()
            .isLength({ min: 6, max: 6 })
            .withMessage('Token must be 6 digits'),
        body('backupCodes').isArray().withMessage('Backup codes are required'),
        body('email').isEmail().withMessage('Valid email is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, secret, token, backupCodes, email } = req.body;

        try {
            // Verify the token first
            const isValid = totpService.verifyToken(secret, token);

            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid token. Please try again.',
                });
            }

            // Hash backup codes
            const hashedBackupCodes = await totpService.hashBackupCodes(backupCodes);

            // Store in database
            await db.query(
                `INSERT INTO security.user_security_settings (user_id, is_2fa_enabled, totp_secret, backup_codes)
         VALUES ($1, true, $2, $3)
         ON CONFLICT (user_id)
         DO UPDATE SET is_2fa_enabled = true, totp_secret = $2, backup_codes = $3, updated_at = NOW()`,
                [userId, secret, JSON.stringify(hashedBackupCodes)]
            );

            // Send confirmation email with backup codes
            await mailService.send2FAActivationEmail(email, backupCodes);

            logger.info('2FA activated successfully', { userId });

            res.json({
                success: true,
                message: '2FA activated successfully. Backup codes sent to your email.',
            });
        } catch (error) {
            logger.error('2FA activation error', { error: error.message, userId });
            res.status(500).json({ error: 'Failed to activate 2FA' });
        }
    }
);

/**
 * POST /2fa/verify
 * Verify a TOTP token during login
 */
router.post(
    '/verify',
    [
        body('userId').isUUID().withMessage('Valid userId is required'),
        body('token')
            .isString()
            .isLength({ min: 6, max: 8 })
            .withMessage('Token must be 6-8 characters'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, token } = req.body;

        try {
            // Check rate limiting
            const rateLimit = await totpService.checkRateLimit(userId);

            if (!rateLimit.allowed) {
                return res.status(429).json({
                    success: false,
                    locked: true,
                    remainingTime: rateLimit.remainingTime,
                    message: rateLimit.message,
                });
            }

            // Get user's TOTP secret
            const result = await db.query(
                'SELECT totp_secret, is_2fa_enabled FROM security.user_security_settings WHERE user_id = $1',
                [userId]
            );

            if (result.rows.length === 0 || !result.rows[0].is_2fa_enabled) {
                return res.status(400).json({
                    success: false,
                    message: '2FA is not enabled for this user',
                });
            }

            const { totp_secret } = result.rows[0];

            // Try TOTP verification first
            let isValid = totpService.verifyToken(totp_secret, token);

            // If TOTP fails, try backup code
            if (!isValid && token.length === 8) {
                isValid = await totpService.verifyBackupCode(userId, token);
            }

            if (isValid) {
                // Reset failed attempts
                await totpService.resetFailedAttempts(userId);

                // Generate verification token
                const verifyToken = tokenService.generateVerifyToken(userId);

                logger.info('2FA verification successful', { userId });

                res.json({
                    success: true,
                    verifyToken,
                    message: '2FA verified successfully',
                });
            } else {
                // Record failed attempt
                await totpService.recordFailedAttempt(userId);

                const newRateLimit = await totpService.checkRateLimit(userId);

                logger.warn('2FA verification failed', { userId, remainingAttempts: newRateLimit.remainingAttempts });

                res.status(400).json({
                    success: false,
                    remainingAttempts: newRateLimit.remainingAttempts,
                    message: 'Invalid token',
                });
            }
        } catch (error) {
            logger.error('2FA verification error', { error: error.message, userId });
            res.status(500).json({ error: 'Failed to verify 2FA token' });
        }
    }
);

/**
 * POST /2fa/disable
 * Disable 2FA for a user
 */
router.post(
    '/disable',
    [
        body('userId').isUUID().withMessage('Valid userId is required'),
        body('token')
            .isString()
            .isLength({ min: 6, max: 8 })
            .withMessage('Token required to disable 2FA'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, token } = req.body;

        try {
            // Verify token first
            const result = await db.query(
                'SELECT totp_secret FROM security.user_security_settings WHERE user_id = $1',
                [userId]
            );

            if (result.rows.length === 0) {
                return res.status(400).json({ error: '2FA not enabled' });
            }

            const { totp_secret } = result.rows[0];
            let isValid = totpService.verifyToken(totp_secret, token);

            // Try backup code if TOTP fails
            if (!isValid && token.length === 8) {
                isValid = await totpService.verifyBackupCode(userId, token);
            }

            if (!isValid) {
                return res.status(400).json({ error: 'Invalid token' });
            }

            // Disable 2FA
            await db.query(
                `UPDATE security.user_security_settings
         SET is_2fa_enabled = false, totp_secret = NULL, backup_codes = '[]'::jsonb
         WHERE user_id = $1`,
                [userId]
            );

            logger.info('2FA disabled', { userId });

            res.json({
                success: true,
                message: '2FA disabled successfully',
            });
        } catch (error) {
            logger.error('2FA disable error', { error: error.message, userId });
            res.status(500).json({ error: 'Failed to disable 2FA' });
        }
    }
);

/**
 * GET /2fa/status
 * Check if 2FA is enabled for a user
 */
router.get('/status/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await db.query(
            'SELECT is_2fa_enabled FROM security.user_security_settings WHERE user_id = $1',
            [userId]
        );

        const is2faEnabled = result.rows.length > 0 ? result.rows[0].is_2fa_enabled : false;

        res.json({
            userId,
            is2faEnabled,
        });
    } catch (error) {
        logger.error('2FA status check error', { error: error.message, userId });
        res.status(500).json({ error: 'Failed to check 2FA status' });
    }
});

module.exports = router;
