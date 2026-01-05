import express from 'express';
import pool from '../utils/db.js';

const router = express.Router();

// Get Credits for User
router.get('/credits/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Simuliere Credits oder hole aus Tabelle (wir haben noch keine billing Tabelle, also Mock oder User-Tabelle)
        // Wir nehmen an, wir fügen credits zur User Tabelle hinzu oder mocken es erstmal

        // Check if user exists
        const userCheck = await pool.query('SELECT id FROM public.users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return Mock Data for now until billing table exists
        res.json({
            credits: 100, // Default Startguthaben
            plan: 'Free',
            userId: userId
        });

    } catch (error) {
        console.error('Credits Error:', error);
        res.status(500).json({ error: 'Failed to fetch credits' });
    }
});

export default router;
