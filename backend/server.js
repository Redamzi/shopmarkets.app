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
const { createClient } = require('@supabase/supabase-js');

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized');
} else {
    console.warn('⚠️ Supabase credentials missing. DB features disabled.');
}

// DB Test Endpoint
app.get('/api/db-test', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not configured' });
    }

    try {
        const { data, error } = await supabase.from('products').select('*').limit(5);
        if (error) throw error;
        res.json({ message: 'Database connection successful', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
