import express from 'express';
// import pool from '../utils/db.js'; 

const router = express.Router();

// Get Sync Logs
router.get('/logs', async (req, res) => {
    // Mock Data for Sync Logs
    // Später aus Tabelle 'sync_logs' laden
    const logs = [
        {
            id: '1',
            status: 'success',
            platform: 'shopify',
            products_synced: 12,
            started_at: new Date().toISOString(),
            details: 'Initial sync complete'
        }
    ];

    res.json(logs);
});

export default router;
