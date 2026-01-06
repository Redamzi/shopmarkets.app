import express from 'express';
import pool from '../utils/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all categories for user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await pool.query(
            `SELECT * FROM public.categories 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// POST create new category
router.post('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, slug, type, source, parentId } = req.body;

        const result = await pool.query(
            `INSERT INTO public.categories (user_id, name, slug, type, source, parent_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [userId, name, slug, type || 'category', source || 'manual', parentId || null]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

export default router;
