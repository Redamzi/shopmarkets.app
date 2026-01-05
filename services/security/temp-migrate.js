
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

const pool = new Pool({
    user: 'postgres',
    host: '91.99.53.147',
    database: 'postgres',
    password: '7xvNtIXSY9LarTuDRpvfPigr73fSfpthpqToZpC7W4pw8dmrKUQIwrk3hc18JN9n',
    port: 5433,
});

async function runMigration() {
    try {
        console.log('Connecting to database...');
        const client = await pool.connect();
        console.log('Connected!');

        const migrationPath = path.join(process.cwd(), 'migrations', '003_add_trusted_devices.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running migration...');
        await client.query(sql);
        console.log('Migration successfully executed!');

        client.release();
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
