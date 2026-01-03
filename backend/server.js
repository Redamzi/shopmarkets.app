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

// --- PRODUCT ROUTES ---

// GET /api/products - Hole alle Produkte des Users
app.get('/api/products', async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'DB not configured' });

    // TODO: Hier müssten wir eigentlich den User prüfen (JWT Token Middleware).
    // Für jetzt holen wir einfach ALLE Produkte (da Demo).

    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// POST /api/products - Produkt erstellen
app.post('/api/products', async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'DB not configured' });

    const raw = req.body;

    // Map Frontend (camelCase) -> DB (snake_case)
    const productData = {
        user_id: raw.user_id || raw.userId, // Falls Frontend userId sendet
        sku: raw.sku,
        title: raw.title,
        price: raw.price,
        stock: raw.stock,
        image_url: raw.imageUrl || raw.image_url, // FIX: imageUrl -> image_url
        channels: raw.channels || [],
        weight: raw.weight,
        shipping_profile: raw.shippingProfile || raw.shipping_profile,
        category: raw.category
    };

    try {
        const { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// --- CONNECTIONS ROUTES ---
app.get('/api/connections', async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'DB not configured' });
    try {
        const { data, error } = await supabase.from('connections').select('*');
        if (error) throw error;

        // Map DB -> Frontend (optional, falls Frontend camelCase erwartet, aber lassen wir erstmal raw)
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/connections', async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'DB not configured' });
    try {
        const raw = req.body;
        // Map Frontend -> DB
        const connectionData = {
            user_id: raw.user_id || raw.userId,
            platform: raw.platform,
            name: raw.name || raw.platform, // Fallback name
            url: raw.shop_url || raw.shopUrl || raw.url, // Map shop_url -> url (DB Schema says 'url')
            api_key: raw.api_key || raw.apiKey,
            status: raw.status || 'active'
        };

        const { data, error } = await supabase.from('connections').insert([connectionData]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        console.error(err); // Logge Fehler für Debugging
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/connections/:id', async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'DB not configured' });
    try {
        const { error } = await supabase.from('connections').delete().eq('id', req.params.id);
        if (error) throw error;
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SYNC LOGS ROUTES ---
app.get('/api/sync-logs', async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'DB not configured' });
    try {
        const { data, error } = await supabase.from('sync_logs').select('*').order('started_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- BILLING / CREDITS ROUTES ---
app.get('/api/credits/:userId', async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'DB not configured' });
    try {
        // Hole Credits. Falls kein Eintrag existiert, nimm an 0 (oder erstelle einen).
        let { data, error } = await supabase.from('user_credits').select('*').eq('user_id', req.params.userId).single();

        if (error && error.code === 'PGRST116') {
            // Kein Eintrag gefunden
            res.json({ credits: 0 });
        } else if (error) {
            throw error;
        } else {
            res.json(data);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- DASHBOARD ROUTES ---
app.get('/api/dashboard/stats', async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'DB not configured' });
    try {
        // Parallel Requests für Performance
        const [products, connections, logs, recentLogs] = await Promise.all([
            supabase.from('products').select('*', { count: 'exact', head: true }),
            supabase.from('connections').select('*', { count: 'exact', head: true }),
            supabase.from('sync_logs').select('*', { count: 'exact', head: true }),
            supabase.from('sync_logs').select('*').order('started_at', { ascending: false }).limit(5)
        ]);

        res.json({
            totalProducts: products.count || 0,
            totalConnections: connections.count || 0,
            totalSyncs: logs.count || 0,
            recentLogs: recentLogs.data || []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
