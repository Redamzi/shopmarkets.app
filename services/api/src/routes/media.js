import express from 'express';
import pool from '../utils/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all media files
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { folderId, type } = req.query;

        let query = `SELECT * FROM public.media_files WHERE user_id = $1`;
        const params = [userId];

        if (folderId) {
            query += ` AND folder_id = $2`;
            params.push(folderId);
        }

        query += ` ORDER BY created_at DESC`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching media:', error);
        res.status(500).json({ error: 'Failed to fetch media' });
    }
});

// GET folders
router.get('/folders', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await pool.query(
            `SELECT * FROM public.media_folders WHERE user_id = $1 ORDER BY name ASC`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching folders:', error);
        res.status(500).json({ error: 'Failed to fetch folders' });
    }
});

export default router;
