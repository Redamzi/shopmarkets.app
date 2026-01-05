import pool from '../utils/db.js';

export const getProducts = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await pool.query('SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error('getProducts error:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

export const addProduct = async (req, res) => {
    try {
        const userId = req.user.userId;
        // Frontend sends camelCase, DB expects snake_case usually.
        // Adjusting columns based on guess. If fails, we migration.
        const { title, price, stock, sku, imageUrl, category, description } = req.body;

        const query = `
            INSERT INTO products (user_id, title, price, stock, sku, image_url, category, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        // Safe cast types
        const values = [
            userId,
            title,
            parseFloat(price) || 0,
            parseInt(stock) || 0,
            sku,
            imageUrl,
            category,
            description
        ];

        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('addProduct error:', err);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        await pool.query('DELETE FROM products WHERE id = $1 AND user_id = $2', [id, userId]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};
