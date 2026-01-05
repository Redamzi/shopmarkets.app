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
        const { email, password } = req.body;

        // Get user
        const result = await pool.query(
            'SELECT id, email, password_hash, is_verified, is_active, full_name FROM public.users WHERE email = $1',
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
        const { userId, code } = req.body;

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
            'SELECT id, email, full_name, avv_accepted_at FROM public.users WHERE id = $1',
            [userId]
        );

        const user = userResult.rows[0];

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
                avvAccepted: !!user.avv_accepted_at
            }
        });
    } catch (error) {
        next(error);
    }
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

// Sign AVV
export const signAVV = async (req, res, next) => {
    try {
        const userId = req.user.userId; // From authMiddleware

        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        await pool.query('BEGIN');

        // Update User
        await pool.query(
            'UPDATE public.users SET avv_accepted_at = NOW() WHERE id = $1',
            [userId]
        );

        // Create Audit Log
        await pool.query(
            'INSERT INTO public.legal_consents (user_id, document_type, version, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
            [userId, 'AVV', '1.0', ip, userAgent]
        );

        await pool.query('COMMIT');

        res.json({ message: 'AVV signed successfully' });
    } catch (error) {
        next(error);
    }
};

