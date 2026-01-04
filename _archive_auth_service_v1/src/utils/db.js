import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Debug Info (ohne Passwort)
console.log(`🔌 Connecting to DB: ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Erhöht auf 10s
    ssl: false // WICHTIG: SSL deaktivieren für interne Docker-Verbindung
});

pool.on('connect', () => {
    console.log('✅ Connected to Auth Database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
});

export default pool;
