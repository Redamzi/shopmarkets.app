import express from 'express';
import pool from '../utils/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import https from 'https';
import { S3Client, PutObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';

const router = express.Router();

// R2 (S3) Configuration
// construct endpoint from Account ID if R2_ENDPOINT is missing
const accountId = process.env.R2_ACCOUNT_ID ? process.env.R2_ACCOUNT_ID.trim() : undefined;
const endpoint = process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

// Custom HTTPS agent to handle R2's SSL configuration
const httpsAgent = new https.Agent({
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2',
    maxVersion: 'TLSv1.3'
});

const s3 = new S3Client({
    region: 'auto',
    endpoint: endpoint,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
    requestHandler: new NodeHttpHandler({
        httpsAgent: httpsAgent,
        connectionTimeout: 30000,
        socketTimeout: 30000,
    }),
});

const R2_BUCKET = process.env.R2_BUCKET_NAME;
// Support both variable names
const R2_DOMAIN = process.env.R2_PUBLIC_DOMAIN || process.env.R2_PUBLIC_URL || '';

// Use Memory Storage (keep file in RAM to measure pure upload speed to R2)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// POST Upload Single File to R2 with Speed Measurement
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user.userId;
        const { folderId } = req.body;

        // Prepare S3 Parameters
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(req.file.originalname);
        const filenameClean = path.basename(req.file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
        const key = `uploads/${userId}/${filenameClean}-${uniqueSuffix}${ext}`; // Organized by User ID

        // --- START TIMER ---
        const startTime = Date.now();

        await s3.send(new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            // ACL: 'public-read' // R2 usually manages public access via bucket settings, but can be added if needed
        }));

        // --- STOP TIMER ---
        const endTime = Date.now();
        const durationMs = endTime - startTime;
        const sizeMb = req.file.size / (1024 * 1024);
        const speedMbps = sizeMb > 0 ? (sizeMb * 8) / (durationMs / 1000) : 0; // Megabits per second

        console.log(`🚀 Upload to R2 took ${durationMs}ms for ${sizeMb.toFixed(2)}MB (${speedMbps.toFixed(2)} Mbps)`);

        // Construct Public URL
        // If R2_DOMAIN is set, use it. Otherwise, use endpoint/bucket/key (often needs tweaking for R2)
        const publicUrl = R2_DOMAIN
            ? `${R2_DOMAIN}/${key}`
            : `${process.env.R2_ENDPOINT}/${R2_BUCKET}/${key}`;

        const result = await pool.query(
            `INSERT INTO public.media_files 
            (user_id, folder_id, filename, url, mime_type, size_bytes, is_active, source, external_id)
            VALUES ($1, $2, $3, $4, $5, $6, true, 'manual', $7)
            RETURNING *`,
            [userId, folderId || null, req.file.originalname, publicUrl, req.file.mimetype, req.file.size, key]
        );

        // Add performance stats to response for frontend display
        const responseData = {
            ...result.rows[0],
            _performance: {
                duration_ms: durationMs,
                speed_mbps: speedMbps.toFixed(2)
            }
        };

        res.json(responseData);

    } catch (error) {
        console.error('Error uploading file to R2:', error);
        res.status(500).json({ error: 'Failed to upload file', details: error.message });
    }
});

// GET all media files
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { folderId } = req.query;

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
        res.status(500).json({ error: 'Failed to fetch media', details: error.message });
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

// DEBUG: Test R2 Connection
router.get('/test-connection', authenticateToken, async (req, res) => {
    try {
        const listCmd = new ListObjectsCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            MaxKeys: 1
        });
        await s3.send(listCmd);
        res.json({ status: 'success', message: 'R2 Connection successful! Bucket is accessible.' });
    } catch (error) {
        console.error('R2 Test Failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'R2 Connection Failed',
            error: error.message,
            code: error.code,
            endpoint: endpoint || 'Missing (Set R2_ACCOUNT_ID or R2_ENDPOINT)',
            bucket: process.env.R2_BUCKET_NAME
        });
    }
});

export default router;
