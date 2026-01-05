
import pool from './db.js';

export const initDatabase = async () => {
    try {
        console.log('🔄 Checking database schema...');

        // 1. Create trusted_devices table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.trusted_devices (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
                device_fingerprint VARCHAR(255) NOT NULL,
                device_name VARCHAR(255),
                ip_address INET,
                user_agent TEXT,
                last_used_at TIMESTAMP DEFAULT NOW(),
                created_at TIMESTAMP DEFAULT NOW(),
                expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
                is_active BOOLEAN DEFAULT true,
                UNIQUE(user_id, device_fingerprint)
            )
        `);

        // 2. Create index
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_trusted_devices_user_fingerprint ON public.trusted_devices(user_id, device_fingerprint);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_trusted_devices_expires ON public.trusted_devices(expires_at);
        `);

        console.log('✅ Database schema verified.');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        // Don't exit process, try to continue
    }
};
