import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import dashboardRoutes from './routes/dashboard.js';
import { authenticateToken } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security & Consistency
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
    origin: function (origin, callback) {
        // Allow all origins for now to avoid CORS hell, or restrict to frontend
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/dashboard', authenticateToken, dashboardRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'api-service' });
});

app.listen(PORT, () => {
    console.log(`🚀 API Service running on port ${PORT}`);
});
