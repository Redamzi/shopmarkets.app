const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

/**
 * Generate a verification token after successful 2FA/code verification
 * This token is used to prove to the main backend that 2FA was successful
 */
function generateVerifyToken(userId, expiresIn = '15m') {
    const payload = {
        userId,
        verified: true,
        type: '2fa_verification',
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

/**
 * Verify a token (for internal service-to-service communication)
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        logger.error('Token verification failed', { error: error.message });
        return null;
    }
}

/**
 * Middleware to verify JWT tokens
 */
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
}

module.exports = {
    generateVerifyToken,
    verifyToken,
    authMiddleware,
};
