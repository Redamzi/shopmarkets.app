import jwt from 'jsonwebtoken';

// FALLBACK SECRET for Debugging (Matches User Log)
const FALLBACK_SECRET = 'ShopMarkets_FORCE_SYNC_2026_V2_SECURE_KEY_123456789';
// FORCE HARDCODED SECRET TO FIX 403 ERROR
const JWT_SECRET = 'ShopMarkets_FORCE_SYNC_2026_V2_SECURE_KEY_123456789';

console.log('🔐 [AUTH] JWT Secret configured. Hash hint:', JWT_SECRET.substring(0, 10));

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('Auth Middleware: No token provided in header:', authHeader);
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('API Auth: Token verification failed!');
            console.error('Error:', err.message);
            // Show first 5 chars of secret to verify consistency with Security Service
            const secretHint = JWT_SECRET ? JWT_SECRET.substring(0, 5) + '...' : 'undefined';
            console.error('API Secret Hint:', secretHint);
            return res.status(403).json({ error: 'Invalid or expired token', details: err.message });
        }
        req.user = user;
        next();
    });
};
