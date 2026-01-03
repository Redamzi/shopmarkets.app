const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const logger = require('../config/logger');

class TotpService {
    constructor() {
        this.window = parseInt(process.env.TOTP_WINDOW) || 1;
        this.step = parseInt(process.env.TOTP_STEP) || 30;
    }

    /**
     * Generate a new TOTP secret for a user
     */
    generateSecret(userId) {
        const secret = speakeasy.generateSecret({
            name: `${process.env.APP_NAME || 'ShopMarkets'} (${userId.substring(0, 8)})`,
            issuer: process.env.APP_NAME || 'ShopMarkets',
            length: 32,
        });

        return {
            secret: secret.base32,
            otpauthUrl: secret.otpauth_url,
        };
    }

    /**
     * Generate QR code for TOTP setup
     */
    async generateQRCode(otpauthUrl) {
        try {
            const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);
            return qrCodeDataURL;
        } catch (error) {
            logger.error('Failed to generate QR code', { error: error.message });
            throw new Error('QR code generation failed');
        }
    }

    /**
     * Verify a TOTP token
     */
    verifyToken(secret, token) {
        return speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: this.window,
            step: this.step,
        });
    }

    /**
     * Generate backup codes for account recovery
     */
    generateBackupCodes(count = 10) {
        const codes = [];
        for (let i = 0; i < count; i++) {
            // Generate 8-character alphanumeric code
            const code = Math.random().toString(36).substring(2, 10).toUpperCase();
            codes.push(code);
        }
        return codes;
    }

    /**
     * Hash backup codes before storing
     */
    async hashBackupCodes(codes) {
        const hashedCodes = [];
        for (const code of codes) {
            const hash = await bcrypt.hash(code, 10);
            hashedCodes.push({ code: hash, used: false });
        }
        return hashedCodes;
    }

    /**
     * Verify a backup code
     */
    async verifyBackupCode(userId, code) {
        try {
            const result = await db.query(
                'SELECT backup_codes FROM security.user_security_settings WHERE user_id = $1',
                [userId]
            );

            if (result.rows.length === 0) {
                return false;
            }

            const backupCodes = result.rows[0].backup_codes || [];

            for (let i = 0; i < backupCodes.length; i++) {
                const storedCode = backupCodes[i];

                // Skip already used codes
                if (storedCode.used) continue;

                // Check if code matches
                const isMatch = await bcrypt.compare(code, storedCode.code);

                if (isMatch) {
                    // Mark code as used
                    backupCodes[i].used = true;

                    await db.query(
                        'UPDATE security.user_security_settings SET backup_codes = $1 WHERE user_id = $2',
                        [JSON.stringify(backupCodes), userId]
                    );

                    logger.info('Backup code used successfully', { userId });
                    return true;
                }
            }

            return false;
        } catch (error) {
            logger.error('Failed to verify backup code', { error: error.message, userId });
            throw error;
        }
    }

    /**
     * Check and update rate limiting
     */
    async checkRateLimit(userId) {
        try {
            const result = await db.query(
                'SELECT failed_attempts, locked_until FROM security.user_security_settings WHERE user_id = $1',
                [userId]
            );

            if (result.rows.length === 0) {
                // Create settings if not exists
                await db.query(
                    'INSERT INTO security.user_security_settings (user_id) VALUES ($1)',
                    [userId]
                );
                return { allowed: true, remainingAttempts: 3 };
            }

            const { failed_attempts, locked_until } = result.rows[0];

            // Check if account is locked
            if (locked_until && new Date(locked_until) > new Date()) {
                const remainingTime = Math.ceil((new Date(locked_until) - new Date()) / 60000);
                return {
                    allowed: false,
                    locked: true,
                    remainingTime,
                    message: `Account locked. Try again in ${remainingTime} minutes.`,
                };
            }

            // Reset lock if expired
            if (locked_until && new Date(locked_until) <= new Date()) {
                await db.query(
                    'UPDATE security.user_security_settings SET failed_attempts = 0, locked_until = NULL WHERE user_id = $1',
                    [userId]
                );
                return { allowed: true, remainingAttempts: 3 };
            }

            const maxAttempts = parseInt(process.env.MAX_FAILED_ATTEMPTS) || 3;
            const remainingAttempts = maxAttempts - failed_attempts;

            if (failed_attempts >= maxAttempts) {
                // Lock account
                const lockoutMinutes = parseInt(process.env.LOCKOUT_DURATION_MINUTES) || 15;
                const lockUntil = new Date(Date.now() + lockoutMinutes * 60000);

                await db.query(
                    'UPDATE security.user_security_settings SET locked_until = $1 WHERE user_id = $2',
                    [lockUntil, userId]
                );

                return {
                    allowed: false,
                    locked: true,
                    remainingTime: lockoutMinutes,
                    message: `Too many failed attempts. Account locked for ${lockoutMinutes} minutes.`,
                };
            }

            return { allowed: true, remainingAttempts };
        } catch (error) {
            logger.error('Failed to check rate limit', { error: error.message, userId });
            throw error;
        }
    }

    /**
     * Record failed attempt
     */
    async recordFailedAttempt(userId) {
        try {
            await db.query(
                'UPDATE security.user_security_settings SET failed_attempts = failed_attempts + 1 WHERE user_id = $1',
                [userId]
            );
        } catch (error) {
            logger.error('Failed to record failed attempt', { error: error.message, userId });
        }
    }

    /**
     * Reset failed attempts on successful login
     */
    async resetFailedAttempts(userId) {
        try {
            await db.query(
                'UPDATE security.user_security_settings SET failed_attempts = 0, locked_until = NULL WHERE user_id = $1',
                [userId]
            );
        } catch (error) {
            logger.error('Failed to reset failed attempts', { error: error.message, userId });
        }
    }
}

module.exports = new TotpService();
