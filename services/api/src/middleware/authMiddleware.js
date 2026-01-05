import jwt from 'jsonwebtoken';

// FALLBACK SECRET for Debugging (Matches User Log)
const FALLBACK_SECRET = 'ShopMarkets_JWT_Secret_2026_a8f3e9d2c1b4f7a6e5d8c3b2a1f9e7d6c5b4a3f2e1d9c8b7a6f5e4d3c2b1a0';
const JWT_SECRET = process.env.JWT_SECRET || FALLBACK_SECRET;

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
