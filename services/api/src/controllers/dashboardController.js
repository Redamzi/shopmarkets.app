import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: false // Internal connection
});

export const getStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Fetch real stats from DB
        const productsCount = await pool.query('SELECT COUNT(*) FROM public.products WHERE user_id = $1', [userId]);
        const connectionsCount = await pool.query('SELECT COUNT(*) FROM public.connections WHERE user_id = $1', [userId]);

        // Mock data for sales (since we don't have orders table yet)
        const totalSales = 0;

        res.json({
            totalSales: totalSales,
            activeProducts: parseInt(productsCount.rows[0].count),
            connectedChannels: parseInt(connectionsCount.rows[0].count),
            recentActivity: [] // Empty for now
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};
