import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'https://start.shopmarkets.app',
    credentials: true
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
