import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../utils/db.js';
import { sendVerificationEmail, send2FACode } from '../utils/email.js';
import { generateCode } from '../utils/helpers.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = '24h';

// Register
export const register = async (req, res, next) => {
    try {
        const { email, password, fullName } = req.body;

        // Check if user exists
        const existingUser = await pool.query(
            'SELECT id FROM public.users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const result = await pool.query(
            'INSERT INTO public.users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, created_at',
            [email, passwordHash, fullName]
        );

        const user = result.rows[0];

        // Generate verification code
        const code = generateCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

        await pool.query(
            'INSERT INTO public.verification_codes (user_id, code, type, expires_at) VALUES ($1, $2, $3, $4)',
            [user.id, code, 'email_verification', expiresAt]
        );

        // Send verification email
        await sendVerificationEmail(email, code);

        res.status(201).json({
            message: 'Registration successful. Please check your email for verification code.',
            userId: user.id
        });
    } catch (error) {
        next(error);
    }
};

// Login (Step 1 - Email/Password)
export const login = async (req, res, next) => {
    try {
        const { email, password, deviceFingerprint } = req.body;

        // Get user
        const result = await pool.query(
            'SELECT id, email, password_hash, is_verified, is_active, full_name, avv_accepted_at, is_avv_signed FROM public.users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({ error: 'Account is disabled' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if device is trusted
        if (deviceFingerprint) {
            const trustedDeviceResult = await pool.query(
                `SELECT id FROM public.trusted_devices 
                WHERE user_id = $1 AND device_fingerprint = $2 
                AND is_active = true AND expires_at > NOW()`,
                [user.id, deviceFingerprint]
            );

            if (trustedDeviceResult.rows.length > 0) {
                // Device is trusted - skip 2FA
                // Update last_used_at
                await pool.query(
                    'UPDATE public.trusted_devices SET last_used_at = NOW() WHERE id = $1',
                    [trustedDeviceResult.rows[0].id]
                );

                // Generate JWT directly
                const token = jwt.sign(
                    { userId: user.id, email: user.email },
                    JWT_SECRET,
                    { expiresIn: JWT_EXPIRES_IN }
                );

                return res.json({
                    message: 'Login successful (trusted device)',
                    token,
                    skipTwoFactor: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        fullName: user.full_name,
                        avv_accepted_at: user.avv_accepted_at,
                        is_avv_signed: user.is_avv_signed || false
                    }
                });
            }
        }

        // Generate 2FA code
        const code = generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        await pool.query(
            'INSERT INTO public.verification_codes (user_id, code, type, expires_at) VALUES ($1, $2, $3, $4)',
            [user.id, code, '2fa_login', expiresAt]
        );

        // Send 2FA code
        await send2FACode(email, code);

        res.json({
            message: '2FA code sent to your email',
            userId: user.id,
            requires2FA: true
        });
    } catch (error) {
        next(error);
    }
};

// Login (Step 2 - Verify 2FA Code)
export const verify2FA = async (req, res, next) => {
    try {
        const { userId, code, trustDevice, deviceFingerprint } = req.body;

        // Get verification code
        const result = await pool.query(
            `SELECT id, expires_at FROM public.verification_codes 
       WHERE user_id = $1 AND code = $2 AND type = '2fa_login' AND used_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
            [userId, code]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        const verificationCode = result.rows[0];

        // Check expiration
        if (new Date() > new Date(verificationCode.expires_at)) {
            return res.status(400).json({ error: 'Code expired' });
        }

        // Mark code as used
        await pool.query(
            'UPDATE public.verification_codes SET used_at = NOW() WHERE id = $1',
            [verificationCode.id]
        );

        // Get user
        const userResult = await pool.query(
            'SELECT id, email, full_name, avv_accepted_at, is_avv_signed FROM public.users WHERE id = $1',
            [userId]
        );

        const user = userResult.rows[0];

        // If user wants to trust this device, save it
        if (trustDevice && deviceFingerprint) {
            try {
                let ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                if (ip && typeof ip === 'string' && ip.includes(',')) {
                    ip = ip.split(',')[0].trim();
                }
                const userAgent = req.headers['user-agent'];
                const deviceName = getUserAgentDeviceName(userAgent);

                // Ensure IP is valid or null (INET type is strict)
                // Basic check if it looks like an IP, otherwise null
                if (ip && !ip.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/) && !ip.includes(':')) {
                    ip = null;
                }

                await pool.query(
                    `INSERT INTO public.trusted_devices 
                    (user_id, device_fingerprint, device_name, ip_address, user_agent, expires_at)
                    VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '30 days')
                    ON CONFLICT (user_id, device_fingerprint) 
                    DO UPDATE SET last_used_at = NOW(), expires_at = NOW() + INTERVAL '30 days', is_active = true`,
                    [user.id, deviceFingerprint, deviceName, ip, userAgent]
                );
            } catch (deviceError) {
                console.error('Failed to save trusted device:', deviceError);
                // Continue login even if saving device fails!
            }
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                avv_accepted_at: user.avv_accepted_at,
                is_avv_signed: user.is_avv_signed || false
            }
        });
    } catch (error) {
        console.error('Verify 2FA Error:', error);
        console.error('Stack:', error.stack);
        next(error);
    }
};

// Helper function to extract device name from user agent
const getUserAgentDeviceName = (userAgent) => {
    if (!userAgent) return 'Unknown Device';

    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Android')) return 'Android Device';
    if (userAgent.includes('Macintosh')) return 'Mac';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Linux')) return 'Linux PC';

    return 'Unknown Device';
};

// Verify Email
export const verifyEmail = async (req, res, next) => {
    try {
        const { userId, code } = req.body;

        const result = await pool.query(
            `SELECT id, expires_at FROM public.verification_codes 
       WHERE user_id = $1 AND code = $2 AND type = 'email_verification' AND used_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
            [userId, code]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        const verificationCode = result.rows[0];

        if (new Date() > new Date(verificationCode.expires_at)) {
            return res.status(400).json({ error: 'Code expired' });
        }

        // Mark code as used and verify user
        await pool.query('BEGIN');
        await pool.query(
            'UPDATE public.verification_codes SET used_at = NOW() WHERE id = $1',
            [verificationCode.id]
        );
        await pool.query(
            'UPDATE public.users SET is_verified = TRUE WHERE id = $1',
            [userId]
        );
        await pool.query('COMMIT');

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        await pool.query('ROLLBACK');
        next(error);
    }
};

// Request Password Reset
export const requestPasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body;

        const result = await pool.query(
            'SELECT id FROM public.users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            // Don't reveal if email exists
            return res.json({ message: 'If email exists, reset code has been sent' });
        }

        const user = result.rows[0];
        const code = generateCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await pool.query(
            'INSERT INTO public.verification_codes (user_id, code, type, expires_at) VALUES ($1, $2, $3, $4)',
            [user.id, code, 'password_reset', expiresAt]
        );

        await send2FACode(email, code);

        res.json({ message: 'If email exists, reset code has been sent' });
    } catch (error) {
        next(error);
    }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
    try {
        const { email, code, newPassword } = req.body;

        const userResult = await pool.query(
            'SELECT id FROM public.users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        const user = userResult.rows[0];

        const codeResult = await pool.query(
            `SELECT id, expires_at FROM public.verification_codes 
       WHERE user_id = $1 AND code = $2 AND type = 'password_reset' AND used_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
            [user.id, code]
        );

        if (codeResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        const verificationCode = codeResult.rows[0];

        if (new Date() > new Date(verificationCode.expires_at)) {
            return res.status(400).json({ error: 'Code expired' });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update password and mark code as used
        await pool.query('BEGIN');
        await pool.query(
            'UPDATE public.users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
            [passwordHash, user.id]
        );
        await pool.query(
            'UPDATE public.verification_codes SET used_at = NOW() WHERE id = $1',
            [verificationCode.id]
        );
        await pool.query('COMMIT');

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        await pool.query('ROLLBACK');
        next(error);
    }
};

// Sign AVV with signature data
export const signAVV = async (req, res, next) => {
    try {
        const userId = req.user.userId; // From authMiddleware
        const { signature_data } = req.body;

        if (!signature_data) {
            return res.status(400).json({ error: 'Signature data is required' });
        }

        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        await pool.query('BEGIN');

        // 1. Check if user already signed (upsert logic)
        const existing = await pool.query(
            'SELECT id FROM public.avv_logs WHERE user_id = $1',
            [userId]
        );

        if (existing.rows.length > 0) {
            // Update existing signature
            await pool.query(
                `UPDATE public.avv_logs 
                SET signature_data = $1, ip_address = $2, signed_at = NOW() 
                WHERE user_id = $3`,
                [signature_data, ip, userId]
            );
        } else {
            // Insert new signature
            await pool.query(
                `INSERT INTO public.avv_logs 
                (user_id, signature_data, ip_address, contract_version, signed_at) 
                VALUES ($1, $2, $3, $4, NOW())`,
                [userId, signature_data, ip, '1.0']
            );
        }

        // 2. Update user flag
        await pool.query(
            'UPDATE public.users SET is_avv_signed = TRUE, avv_accepted_at = NOW() WHERE id = $1',
            [userId]
        );

        await pool.query('COMMIT');

        res.json({
            success: true,
            message: 'AVV signed successfully'
        });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Sign AVV Error:', error);
        next(error);
    }
};

// Get AVV signature status
export const getAVVStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            'SELECT is_avv_signed FROM public.users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({ is_signed: false });
        }

        res.json({ is_signed: result.rows[0].is_avv_signed || false });
    } catch (error) {
        console.error('Get AVV Status Error:', error);
        res.json({ is_signed: false });
    }
};

// Get AVV signature data (with self-healing)
export const getAVVSignature = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            'SELECT signature_data, signed_at FROM public.avv_logs WHERE user_id = $1 ORDER BY signed_at DESC LIMIT 1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({
                is_signed: false,
                signature_data: null,
                signed_at: null
            });
        }

        const signature = result.rows[0];

        // SELF-HEALING: Ensure user flag is set
        try {
            await pool.query(
                'UPDATE public.users SET is_avv_signed = TRUE WHERE id = $1 AND is_avv_signed = FALSE',
                [userId]
            );
        } catch (healError) {
            console.warn('Self-healing failed:', healError);
        }

        res.json({
            is_signed: true,
            signature_data: signature.signature_data,
            signed_at: signature.signed_at
        });
    } catch (error) {
        console.error('Get AVV Signature Error:', error);
        res.json({
            is_signed: false,
            signature_data: null,
            signed_at: null
        });
    }
};

// Verify Token and return current user
export const verifyToken = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            'SELECT id, email, full_name, avv_accepted_at, is_avv_signed FROM public.users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        res.json({
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                avv_accepted_at: user.avv_accepted_at,
                is_avv_signed: user.is_avv_signed || false
            }
        });
    } catch (error) {
        console.error('Verify Token Error:', error);
        next(error);
    }
};

