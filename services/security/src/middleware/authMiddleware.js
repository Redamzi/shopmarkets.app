import jwt from 'jsonwebtoken';

// FORCE HARDCODED SECRET TO MATCH API & CONTROLLER (FIX 403)
const JWT_SECRET = 'ShopMarkets_FORCE_SYNC_2026_V2_SECURE_KEY_123456789';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Auth Middleware: Token verification failed!');
            console.error('Error:', err.message);
            console.error('Used Secret (first 5 chars):', JWT_SECRET.substring(0, 5));
            return res.status(403).json({ error: 'Invalid or expired token', details: err.message });
        }
        req.user = user;
        next();
    });
};
