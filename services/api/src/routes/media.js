import express from 'express';
import multer from 'multer';
// Import additional commands
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, CreateBucketCommand, PutBucketPolicyCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import pool from '../utils/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
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
 * 🛠️ POST /api/media/setup
 * Manually init bucket and policy
 */
router.get('/setup', async (req, res) => {
    try {
        console.log(`🛠️ Setup: Checking bucket '${BUCKET_NAME}' at ${S3_ENDPOINT}...`);

        // 1. Check if exists
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

        // 2. Set Public Policy
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

// Configure Multer (Memory Storage so we can stream to S3)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB Limit
});

// Helper: Get Public URL
const getPublicUrl = (key) => {
    // Falls custom domain konfiguriert
    if (S3_PUBLIC_ENDPOINT) {
        return `${S3_PUBLIC_ENDPOINT}/${BUCKET_NAME}/${key}`;
    }
    return `${S3_ENDPOINT}/${BUCKET_NAME}/${key}`;
};

/**
 * 📂 GET /api/media
 * List files for the specific user/folder
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.user?.userId || '0eae9e61-8051-40c2-b5e9-d3493836a935'; // Hardcoded ID for testing (Amzi) if no auth

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
 * 📁 GET /api/media/folders
 * List folders for the user
 */
router.get('/folders', async (req, res) => {
    try {
        const userId = req.user?.userId || '0eae9e61-8051-40c2-b5e9-d3493836a935';
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
 * 📤 POST /api/media/upload
 * Upload file to S3/MinIO
 */
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const client = await pool.connect();

    try {
        const userId = req.user?.userId || '0eae9e61-8051-40c2-b5e9-d3493836a935'; // Hardcoded Test ID
        const folderId = req.body.folderId || null; // Optional folder

        // Generate unique key: userId/year/month/uuid-filename
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const uniqueId = uuidv4();
        const ext = path.extname(req.file.originalname);
        const sanitizeFilename = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');

        const key = `${userId}/${year}/${month}/${uniqueId}-${sanitizeFilename}`;

        console.log(`📤 Uploading to S3: ${key} (${req.file.size} bytes)`);

        // Stream Upload to S3
        const parallelUploads3 = new Upload({
            client: s3Client,
            params: {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
                // ACL: 'public-read' // MinIO Bucket config handles this usually
            },
        });

        await parallelUploads3.done();

        const publicUrl = getPublicUrl(key);
        console.log(`✅ Upload success: ${publicUrl}`);

        // Save metadata to DB
        const result = await client.query(
            `INSERT INTO public.media_files 
             (user_id, folder_id, filename, file_path, url, type, size_bytes, is_active, external_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8) 
             RETURNING *`,
            [userId, folderId, req.file.originalname, key, publicUrl, req.file.mimetype, req.file.size, uniqueId]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('❌ Upload Error Details:', error);
        console.error('❌ S3 Config:', {
            bucket: BUCKET_NAME,
            region: S3_REGION,
            endpoint: S3_ENDPOINT
        });
        res.status(500).json({ error: 'Upload failed', details: error.message });
    } finally {
        client.release();
    }
});

/**
 * 🗑️ DELETE /api/media/:id
 * Delete file from S3 and DB
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.userId;
        const fileId = req.params.id;

        // Get file info first
        const fileResult = await client.query(
            'SELECT * FROM public.media_files WHERE id = $1 AND user_id = $2',
            [fileId, userId]
        );

        if (fileResult.rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = fileResult.rows[0];
        const s3Key = file.file_path; // We stored S3 Key in file_path or constructed it

        // Delete from S3
        if (s3Key) {
            try {
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: s3Key
                }));
                console.log(`🗑️ Deleted from S3: ${s3Key}`);
            } catch (s3Err) {
                console.error('S3 Delete Warning:', s3Err.message);
                // Continue to delete from DB even if S3 fails (orphaned file better than broken UI)
            }
        }

        // Delete from DB (Soft delete or Hard delete? Let's do Soft for safety, or Hard if requested)
        // User asked for "stable", let's do Hard Delete to keep clean
        await client.query('DELETE FROM public.media_files WHERE id = $1', [fileId]);

        res.json({ message: 'File deleted successfully' });

    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ error: 'Delete failed' });
    } finally {
        client.release();
    }
});

/**
 * 📁 POST /api/media/folders
 * Create Folder
 */
router.post('/folders', authenticateToken, async (req, res) => {
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
 * 🗑️ DELETE /api/media/folders/:id
 * Delete Folder
 */
router.delete('/folders/:id', authenticateToken, async (req, res) => {
    try {
        const folderId = req.params.id;
        const userId = req.user.userId;
        // Move contents to root (folder_id = null)
        await pool.query(
            'UPDATE public.media_files SET folder_id = NULL WHERE folder_id = $1 AND user_id = $2',
            [folderId, userId]
        );
        // Delete folder
        await pool.query(
            'DELETE FROM public.media_folders WHERE id = $1 AND user_id = $2',
            [folderId, userId]
        );
        res.json({ message: 'Folder deleted, contents moved to root' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete folder' });
    }
});

/**
 * 🔄 PUT /api/media/:id/move
 * Move file to folder
 */
router.put('/:id/move', authenticateToken, async (req, res) => {
    try {
        const { folderId } = req.body; // null for root
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
