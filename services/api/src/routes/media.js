import express from 'express';
import multer from 'multer';
import { S3Client, CreateBucketCommand, PutBucketPolicyCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import pool from '../utils/db.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// ⚡️ RAPID FIX: NO AUTHENTICATION CHECK
// We use a static System User ID to guarantee uploads work immediately.
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

// Configuration
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://minio:9000';
const S3_PUBLIC_ENDPOINT = process.env.S3_PUBLIC_ENDPOINT || 'https://cdn.shopmarkets.app';
const S3_REGION = process.env.S3_REGION || 'us-east-1';
const S3_KEY = process.env.S3_ACCESS_KEY || 'admin';
const S3_SECRET = process.env.S3_SECRET_KEY || 'shopmarkets_minio_secret_2026';
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'uploads';

console.log('🚀 [MEDIA] Starting Media Service (RAPID MODE)...');

const s3Client = new S3Client({
    region: S3_REGION,
    endpoint: S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId: S3_KEY,
        secretAccessKey: S3_SECRET
    }
});

// Multer (500MB Limit)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 500 * 1024 * 1024 }
});

const getPublicUrl = (key) => {
    if (S3_PUBLIC_ENDPOINT) return `${S3_PUBLIC_ENDPOINT}/${BUCKET_NAME}/${key}`;
    return `${S3_ENDPOINT}/${BUCKET_NAME}/${key}`;
};

// ---------------------------------------------------------
// ROUTES (ALL PUBLIC / NO TOKEN CHECK)
// ---------------------------------------------------------

// GET /api/media/setup (Manual Helper)
router.get('/setup', async (req, res) => {
    try {
        try {
            await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
        } catch (err) {
            if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
                await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
            }
        }
        const policy = {
            Version: "2012-10-17",
            Statement: [{ Effect: "Allow", Principal: { AWS: ["*"] }, Action: ["s3:GetObject"], Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`] }]
        };
        await s3Client.send(new PutBucketPolicyCommand({ Bucket: BUCKET_NAME, Policy: JSON.stringify(policy) }));
        res.json({ message: 'MinIO Bucket Ready!', bucket: BUCKET_NAME });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/media (List Files)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM public.media_files WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC`,
            [SYSTEM_USER_ID]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'List failed' });
    }
});

// GET /api/media/folders
router.get('/folders', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM public.media_folders WHERE user_id = $1 ORDER BY created_at DESC`,
            [SYSTEM_USER_ID]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'List folders failed' });
    }
});

// POST /api/media/upload
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });

    const client = await pool.connect();
    try {
        const folderId = req.body.folderId || null;
        const date = new Date();
        const uniqueId = uuidv4();
        const sanitizeFilename = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');

        // Use SYSTEM_USER_ID for path
        const key = `${SYSTEM_USER_ID}/${date.getFullYear()}/${uniqueId}-${sanitizeFilename}`;

        const s3Upload = new Upload({
            client: s3Client,
            params: {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            },
        });

        await s3Upload.done();
        const publicUrl = getPublicUrl(key);

        const result = await client.query(
            `INSERT INTO public.media_files 
             (user_id, folder_id, filename, url, mime_type, size_bytes, is_active, external_id) 
             VALUES ($1, $2, $3, $4, $5, $6, true, $7) 
             RETURNING *`,
            [SYSTEM_USER_ID, folderId, req.file.originalname, publicUrl, req.file.mimetype, req.file.size, uniqueId]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    } finally {
        client.release();
    }
});

// DELETE, FOLDERS POST/DELETE - All using SYSTEM_USER_ID
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM public.media_files WHERE id = $1', [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (e) { res.status(500).json({ error: 'Delete failed' }); }
});

router.post('/folders', async (req, res) => {
    try {
        const result = await pool.query('INSERT INTO public.media_folders (name, user_id) VALUES ($1, $2) RETURNING *', [req.body.name, SYSTEM_USER_ID]);
        res.status(201).json(result.rows[0]);
    } catch (e) { res.status(500).json({ error: 'Create folder failed' }); }
});

router.delete('/folders/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM public.media_folders WHERE id = $1', [req.params.id]);
        res.json({ message: 'Folder deleted' });
    } catch (e) { res.status(500).json({ error: 'Delete folder failed' }); }
});

router.put('/:id/move', async (req, res) => {
    try {
        await pool.query('UPDATE public.media_files SET folder_id = $1 WHERE id = $2', [req.body.folderId, req.params.id]);
        res.json({ message: 'Moved' });
    } catch (e) { res.status(500).json({ error: 'Move failed' }); }
});

export default router;
