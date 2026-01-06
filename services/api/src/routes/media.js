import express from 'express';
import pool from '../utils/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { S3Client, ListObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const router = express.Router();

// R2 (S3) Configuration
const accountId = process.env.R2_ACCOUNT_ID ? process.env.R2_ACCOUNT_ID.trim() : undefined;
const endpoint = process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

const s3 = new S3Client({
    region: 'auto',
    endpoint: endpoint,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const R2_BUCKET = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

// POST /api/media/upload - Generate pre-signed URL for direct upload
router.post('/upload', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { fileName, fileType } = req.body;

        if (!fileName || !fileType) {
            return res.status(400).json({ error: 'fileName and fileType are required' });
        }

        // Generate unique key
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const key = `uploads/${userId}/${timestamp}-${randomStr}-${fileName}`;

        // Generate pre-signed URL (valid for 5 minutes)
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
        const publicUrl = `${R2_PUBLIC_URL}/${key}`;

        console.log(`✅ Pre-signed URL generated for: ${key}`);

        res.json({
            uploadUrl,
            key,
            publicUrl,
        });
    } catch (error) {
        console.error('❌ Error generating pre-signed URL:', error);
        res.status(500).json({
            error: 'Failed to generate upload URL',
            details: error.message
        });
    }
});

// POST /api/media/confirm - Save metadata after successful upload
router.post('/confirm', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { key, title, category_id, fileSize, uploadDuration } = req.body;

        if (!key) {
            return res.status(400).json({ error: 'key is required' });
        }

        const publicUrl = `${R2_PUBLIC_URL}/${key}`;

        // Save to database
        const result = await pool.query(
            `INSERT INTO public.media_files 
            (user_id, folder_id, filename, url, mime_type, size_bytes, is_active, source, external_id)
            VALUES ($1, $2, $3, $4, $5, $6, true, 'manual', $7)
            RETURNING *`,
            [userId, category_id || null, title || key.split('/').pop(), publicUrl, 'application/octet-stream', fileSize || 0, key]
        );

        console.log(`✅ Media saved to DB: ${key}`);

        res.json({
            ...result.rows[0],
            _performance: {
                duration_ms: uploadDuration,
                speed_mbps: fileSize && uploadDuration ? ((fileSize / (1024 * 1024) * 8) / (uploadDuration / 1000)).toFixed(2) : 0
            }
        });
    } catch (error) {
        console.error('❌ Error saving media metadata:', error);
        res.status(500).json({
            error: 'Failed to save media',
            details: error.message
        });
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
            Bucket: R2_BUCKET,
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
            endpoint: endpoint || 'Missing',
            bucket: R2_BUCKET
        });
    }
});

export default router;
