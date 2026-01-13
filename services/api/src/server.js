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
import uploadRoutes from './routes/upload.js';
import billingRoutes from './routes/billing.js';
import syncRoutes from './routes/sync.js';
import categoryRoutes from './routes/categories.js';
import mediaRoutes from './routes/media.js';
import productWizardRoutes from './routes/productWizard.js';
import pool from './utils/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security & Consistency
app.set('trust proxy', 1);
app.use(helmet());
// CORS relaxed for production stability
app.use(cors({
    origin: true, // Reflects the request origin, allowing all provided they send an origin header
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.options('*', cors()); // Enable pre-flight for all routes
app.use(express.json());

// Serve uploaded files statically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/connections', authenticateToken, connectionRoutes);
app.use('/api/upload', authenticateToken, uploadRoutes);
app.use('/api/billing', authenticateToken, billingRoutes);
app.use('/api/sync', authenticateToken, syncRoutes);
app.use('/api/categories', authenticateToken, categoryRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/product-wizard', productWizardRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'api-service' });
});





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
