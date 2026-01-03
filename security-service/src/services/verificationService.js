const bcrypt = require('bcrypt');
const db = require('../config/database');
const logger = require('../config/logger');
const mailService = require('./mailService');

class VerificationService {
    constructor() {
        this.codeLength = parseInt(process.env.CODE_LENGTH) || 6;
        this.expiryMinutes = parseInt(process.env.CODE_EXPIRY_MINUTES) || 10;
    }

    /**
     * Generate a random numeric code
     */
    generateCode() {
        const min = Math.pow(10, this.codeLength - 1);
        const max = Math.pow(10, this.codeLength) - 1;
        return Math.floor(Math.random() * (max - min + 1) + min).toString();
    }

    /**
     * Send verification code via email
     */
    async sendCode(userId, email, type = 'LOGIN') {
        try {
            // Generate code
            const code = this.generateCode();
            const codeHash = await bcrypt.hash(code, 10);

            // Calculate expiry
            const expiresAt = new Date(Date.now() + this.expiryMinutes * 60000);

            // Store in database
            await db.query(
                `INSERT INTO security.verification_codes (user_id, code_hash, type, expires_at)
         VALUES ($1, $2, $3, $4)`,
                [userId, codeHash, type, expiresAt]
            );

            // Send email
            await mailService.sendVerificationCode(email, code, type);

            logger.info('Verification code sent', { userId, type, expiresAt });

            return {
                success: true,
                expiresAt,
                message: `Code sent to ${email}`,
            };
        } catch (error) {
            logger.error('Failed to send verification code', {
                error: error.message,
                userId,
                type,
            });
            throw new Error('Failed to send verification code');
        }
    }

    /**
     * Verify a code
     */
    async verifyCode(userId, code, type = 'LOGIN') {
        try {
            // Get all unexpired codes for this user and type
            const result = await db.query(
                `SELECT id, code_hash, expires_at, used_at
         FROM security.verification_codes
         WHERE user_id = $1 AND type = $2 AND expires_at > NOW() AND used_at IS NULL
         ORDER BY created_at DESC`,
                [userId, type]
            );

            if (result.rows.length === 0) {
                logger.warn('No valid verification code found', { userId, type });
                return {
                    success: false,
                    message: 'Invalid or expired code',
                };
            }

            // Check each code (in case user requested multiple)
            for (const row of result.rows) {
                const isMatch = await bcrypt.compare(code, row.code_hash);

                if (isMatch) {
                    // Mark code as used
                    await db.query(
                        'UPDATE security.verification_codes SET used_at = NOW() WHERE id = $1',
                        [row.id]
                    );

                    // Clean up old codes for this user
                    await this.cleanupOldCodes(userId, type);

                    logger.info('Verification code verified successfully', { userId, type });

                    return {
                        success: true,
                        message: 'Code verified successfully',
                    };
                }
            }

            logger.warn('Invalid verification code provided', { userId, type });
            return {
                success: false,
                message: 'Invalid code',
            };
        } catch (error) {
            logger.error('Failed to verify code', {
                error: error.message,
                userId,
                type,
            });
            throw new Error('Failed to verify code');
        }
    }

    /**
     * Clean up old verification codes
     */
    async cleanupOldCodes(userId, type) {
        try {
            await db.query(
                `DELETE FROM security.verification_codes
         WHERE user_id = $1 AND type = $2 AND (used_at IS NOT NULL OR expires_at < NOW())`,
                [userId, type]
            );
        } catch (error) {
            logger.error('Failed to cleanup old codes', { error: error.message });
        }
    }

    /**
     * Check if user has valid code
     */
    async hasValidCode(userId, type = 'LOGIN') {
        try {
            const result = await db.query(
                `SELECT COUNT(*) as count
         FROM security.verification_codes
         WHERE user_id = $1 AND type = $2 AND expires_at > NOW() AND used_at IS NULL`,
                [userId, type]
            );

            return result.rows[0].count > 0;
        } catch (error) {
            logger.error('Failed to check for valid code', { error: error.message });
            return false;
        }
    }
}

module.exports = new VerificationService();
