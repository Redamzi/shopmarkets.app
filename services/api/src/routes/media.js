import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand, DeleteObjectCommand, CreateBucketCommand, PutBucketPolicyCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import pool from '../utils/db.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * 🛠️ CONFIGURATION
 */
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://minio:9000';
const S3_PUBLIC_ENDPOINT = process.env.S3_PUBLIC_ENDPOINT || 'https://cdn.shopmarkets.app';
const S3_REGION = process.env.S3_REGION || 'us-east-1';
const S3_KEY = process.env.S3_ACCESS_KEY || 'admin';
const S3_SECRET = process.env.S3_SECRET_KEY || 'shopmarkets_minio_secret_2026';
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'uploads';

console.log('🚀 [MEDIA] Initializing S3/MinIO Client...');

const s3Client = new S3Client({
    region: S3_REGION,
    endpoint: S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId: S3_KEY,
        secretAccessKey: S3_SECRET
    }
});

/**
 * 🛠️ GET /setup
 * Helper to manually verify/create bucket
 */
router.get('/setup', async (req, res) => {
    try {
        console.log(`🛠️ Setup: Checking bucket '${BUCKET_NAME}' at ${S3_ENDPOINT}...`);

        try {
            await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
            console.log('✅ Bucket exists.');
        } catch (err) {
            if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
                console.log('⚠️ Bucket missing. Creating...');
                await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
                console.log('✅ Bucket created.');
            } else {
                throw err;
            }
        }

        const policy = {
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Principal: { AWS: ["*"] },
                    Action: ["s3:GetObject"],
                    Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
                }
            ]
        };

        await s3Client.send(new PutBucketPolicyCommand({
            Bucket: BUCKET_NAME,
            Policy: JSON.stringify(policy)
        }));
        console.log('✅ Public Policy set.');

        res.json({ message: 'MinIO Bucket setup complete!', bucket: BUCKET_NAME });
    } catch (error) {
        console.error('❌ Setup Failed:', error);
        res.status(500).json({ error: 'Setup failed', details: error.message });
    }
});

// Multer Config (Memory Storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

// Helper: Public URL
const getPublicUrl = (key) => {
    if (S3_PUBLIC_ENDPOINT) {
        return `${S3_PUBLIC_ENDPOINT}/${BUCKET_NAME}/${key}`;
    }
    return `${S3_ENDPOINT}/${BUCKET_NAME}/${key}`;
};

/**
 * 📂 GET /
 * List files for the authenticated user
 */
router.get('/', async (req, res) => {
    try {
        // Authenticated user from middleware
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT * FROM public.media_files 
             WHERE user_id = $1 AND is_active = true 
             ORDER BY created_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('List Files Error:', error);
        res.status(500).json({ error: 'Failed to list files' });
    }
});

/**
 * 📁 GET /folders
 * List folders for the authenticated user
 */
router.get('/folders', async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await pool.query(
            `SELECT * FROM public.media_folders 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('List Folders Error:', error);
        res.status(500).json({ error: 'Failed to list folders' });
    }
});

/**
 * 📤 POST /upload
 * Upload file to S3 and save metadata
 */
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const client = await pool.connect();

    try {
        const userId = req.user.userId;
        const folderId = req.body.folderId || null;

        // Path: userId/year/month/uuid-filename
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const uniqueId = uuidv4();
        const sanitizeFilename = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');

        const key = `${userId}/${year}/${month}/${uniqueId}-${sanitizeFilename}`;

        console.log(`📤 Uploading: ${key}`);

        // S3 Upload
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

        // DB Insert
        const result = await client.query(
            `INSERT INTO public.media_files 
             (user_id, folder_id, filename, file_path, url, type, size_bytes, is_active, external_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8) 
             RETURNING *`,
            [userId, folderId, req.file.originalname, key, publicUrl, req.file.mimetype, req.file.size, uniqueId]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('❌ Upload Error:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    } finally {
        client.release();
    }
});

/**
 * 🗑️ DELETE /:id
 * Hard delete file
 */
router.delete('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.userId;
        const fileId = req.params.id;

        const fileResult = await client.query(
            'SELECT * FROM public.media_files WHERE id = $1 AND user_id = $2',
            [fileId, userId]
        );

        if (fileResult.rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = fileResult.rows[0];

        // S3 Delete
        if (file.file_path) {
            try {
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: file.file_path
                }));
            } catch (err) {
                console.warn('S3 Delete Warning:', err.message);
            }
        }

        // DB Delete
        await client.query('DELETE FROM public.media_files WHERE id = $1', [fileId]);

        res.json({ message: 'File deleted' });

    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ error: 'Delete failed' });
    } finally {
        client.release();
    }
});

/**
 * � POST /folders
 */
router.post('/folders', async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.userId;
        const result = await pool.query(
            'INSERT INTO public.media_folders (name, user_id) VALUES ($1, $2) RETURNING *',
            [name, userId]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create folder' });
    }
});

/**
 * 🗑️ DELETE /folders/:id
 */
router.delete('/folders/:id', async (req, res) => {
    try {
        const folderId = req.params.id;
        const userId = req.user.userId;
        await pool.query('UPDATE public.media_files SET folder_id = NULL WHERE folder_id = $1 AND user_id = $2', [folderId, userId]);
        await pool.query('DELETE FROM public.media_folders WHERE id = $1 AND user_id = $2', [folderId, userId]);
        res.json({ message: 'Folder deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete folder' });
    }
});

/**
 * 🔄 PUT /:id/move
 */
router.put('/:id/move', async (req, res) => {
    try {
        const { folderId } = req.body;
        const fileId = req.params.id;
        const userId = req.user.userId;
        await pool.query(
            'UPDATE public.media_files SET folder_id = $1 WHERE id = $2 AND user_id = $3',
            [folderId, fileId, userId]
        );
        res.json({ message: 'File moved' });
    } catch (error) {
        res.status(500).json({ error: 'Move failed' });
    }
});

export default router;
