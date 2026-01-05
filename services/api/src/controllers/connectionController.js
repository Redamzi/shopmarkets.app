import pool from '../utils/db.js';

export const getConnections = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await pool.query('SELECT * FROM connections WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error('getConnections error:', err);
        res.status(500).json({ error: 'Failed to fetch connections' });
    }
};

export const addConnection = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { platform, name, api_key, url, shop_url } = req.body;

        const query = `
            INSERT INTO connections (user_id, platform, name, api_key, url, shop_url, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'active')
            RETURNING *
        `;
        const values = [userId, platform, name, api_key, url, shop_url];
        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('addConnection error:', err);
        res.status(500).json({ error: 'Failed to create connection' });
    }
};

export const deleteConnection = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        await pool.query('DELETE FROM connections WHERE id = $1 AND user_id = $2', [id, userId]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete connection' });
    }
};
