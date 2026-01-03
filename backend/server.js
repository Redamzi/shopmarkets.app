const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Health Check Endpoint (wie gewünscht)
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'shopmarkets-api',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// API Routes Placeholder
app.get('/api/v1/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
