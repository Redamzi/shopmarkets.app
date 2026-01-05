import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

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
