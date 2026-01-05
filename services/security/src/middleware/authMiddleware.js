import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

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
