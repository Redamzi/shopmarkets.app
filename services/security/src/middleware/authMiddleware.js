import jwt from 'jsonwebtoken';

// Use Environment Variable OR Fallback
const JWT_SECRET = process.env.JWT_SECRET || 'ShopMarkets_FORCE_SYNC_2026_V2_SECURE_KEY_123456789';

console.log('🔐 [SECURITY] JWT Secret configured. Hash hint:', JWT_SECRET ? JWT_SECRET.substring(0, 10) + '...' : 'UNDEFINED');

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Security Auth: Token verification failed!', err.message);
            console.error('Used Secret (Hint):', JWT_SECRET.substring(0, 5) + '...');
            return res.status(403).json({ error: 'Invalid or expired token', details: err.message });
        }
        req.user = user;
        next();
    });
};
