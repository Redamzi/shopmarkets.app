import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dashboardRoutes from './routes/dashboard.js';
import { authenticateToken } from './middleware/authMiddleware.js';
import productRoutes from './routes/products.js';
import connectionRoutes from './routes/connections.js';
import pool from './utils/db.js';

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
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/connections', authenticateToken, connectionRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'api-service' });
});



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-Run Migrations
const initDB = async () => {
    try {
        const migrationPath = path.join(__dirname, '../migrations/init.sql');
        if (fs.existsSync(migrationPath)) {
            const sql = fs.readFileSync(migrationPath, 'utf8');
            await pool.query(sql);
            console.log('✅ Database tables initialized (products, connections).');
        } else {
            console.warn(`⚠️ Migration file not found at ${migrationPath}`);
        }
    } catch (err) {
        console.error('❌ Database initialization failed:', err);
    }
};

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 API Service running on port ${PORT}`);
    });
});
