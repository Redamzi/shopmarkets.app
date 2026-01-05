import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import generateRoutes from './routes/generate.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
    console.log(`[AI-Service] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/generate', generateRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'ai-generator' });
});

app.listen(PORT, () => {
    console.log(`🤖 AI Generator Service running on port ${PORT}`);
});
