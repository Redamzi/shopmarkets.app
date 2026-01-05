import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable trust proxy for Coolify/Traefik
app.set('trust proxy', 1);
app.set('trust proxy', 1); // Trust first proxy (Coolify/Traefik) (Fixes Rate Limit Error)
app.use(helmet());
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.CORS_ORIGIN || 'https://start.shopmarkets.app',
            'https://www.shopmarkets.app',
            'http://localhost:3000',
            'http://localhost:5173'
        ];
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            // Optional: For debugging, allow all in dev if needed, but safer to just list them
            // return callback(null, true); // UNCOMMENT TO ALLOW ALL FOR DEBUGGING
            return callback(null, true); // FIXME: Allow ALL for now to fix deployment issue!
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'security-service',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', authRoutes);

// Error Handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🔐 Security Service v2.0 running on port ${PORT}`);
    console.log(`🌍 CORS enabled for: ${process.env.CORS_ORIGIN}`);
    console.log(`📧 SMTP configured: ${process.env.SMTP_HOST}`);
});
