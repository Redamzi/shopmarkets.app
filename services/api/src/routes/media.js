import express from 'express';
import pool from '../utils/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';

const router = express.Router();

// Configuration
// In Production/Coolify: Mount a persistent volume to /app/uploads
const UPLOAD_ROOT = process.env.UPLOAD_DIR || 'uploads';
const CDN_BASE_URL = process.env.CDN_URL || 'https://cdn.shopmarkets.app';

// Ensure root upload dir exists
fs.ensureDirSync(UPLOAD_ROOT);

// Configure Multer for Local Disk Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Organize files by User ID
        const userId = req.user.userId;
        const userDir = path.join(UPLOAD_ROOT, userId);

        // Ensure user directory exists
        fs.ensureDirSync(userDir);

        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        // Generate secure unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        // Clean filename (remove special chars)
        const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');

        cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// POST /api/media/upload - Handle file upload locally
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user.userId;
        const { folderId } = req.body;

        // Construct the relative path (stored in DB) and full Public URL
        const filename = req.file.filename;
        // relativePath on disk relative to UPLOAD_ROOT is just userId/filename
        // BUT public URL needs 'uploads/' prefix if CDN serves from root
        const relativePath = `${userId}/${filename}`;
        const publicUrl = `${CDN_BASE_URL}/uploads/${relativePath}`;
        const fileSize = req.file.size;
        const mimeType = req.file.mimetype;

        console.log(`✅ File saved locally: ${relativePath}`);
        console.log(`📍 Public URL: ${publicUrl}`);

        // Save metadata to DB
        const result = await pool.query(
            `INSERT INTO public.media_files 
            (user_id, folder_id, filename, url, mime_type, size_bytes, is_active, source, external_id)
            VALUES ($1, $2, $3, $4, $5, $6, true, 'local', $7)
            RETURNING *`,
            [userId, folderId || null, req.file.originalname, publicUrl, mimeType, fileSize, relativePath]
        );

        res.json({
            ...result.rows[0],
            _performance: {
                duration_ms: 0, // Not measured for local upload
                speed_mbps: 0
            }
        });

    } catch (error) {
        console.error('❌ Upload Error:', error);
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

// POST /api/media/folders - Create new folder
router.post('/folders', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Folder name is required' });
        }

        const result = await pool.query(
            `INSERT INTO public.media_folders (user_id, name) VALUES ($1, $2) RETURNING *`,
            [userId, name]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({ error: 'Failed to create folder' });
    }
});

// DELETE /api/media/folders/:id - Delete folder
router.delete('/folders/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const folderId = req.params.id;

        // Verify ownership
        const check = await pool.query(
            `SELECT * FROM public.media_folders WHERE id = $1 AND user_id = $2`,
            [folderId, userId]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        // Move files in this folder to root (folder_id = NULL) or delete them?
        // Let's move to root for safety.
        await pool.query(
            `UPDATE public.media_files SET folder_id = NULL WHERE folder_id = $1 AND user_id = $2`,
            [folderId, userId]
        );

        // Delete folder
        await pool.query(`DELETE FROM public.media_folders WHERE id = $1`, [folderId]);

        res.json({ message: 'Folder deleted, files moved to root' });
    } catch (error) {
        console.error('Error deleting folder:', error);
        res.status(500).json({ error: 'Failed to delete folder' });
    }
});

// PUT /api/media/:id/move - Move file to folder
router.put('/:id/move', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const fileId = req.params.id;
        const { folderId } = req.body; // Can be null for root

        // Verify file ownership
        const fileCheck = await pool.query(
            `SELECT * FROM public.media_files WHERE id = $1 AND user_id = $2`,
            [fileId, userId]
        );
        if (fileCheck.rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        // If folderId is provided, verify folder ownership
        if (folderId) {
            const folderCheck = await pool.query(
                `SELECT * FROM public.media_folders WHERE id = $1 AND user_id = $2`,
                [folderId, userId]
            );
            if (folderCheck.rows.length === 0) {
                return res.status(404).json({ error: 'Folder not found' });
            }
        }

        const result = await pool.query(
            `UPDATE public.media_files SET folder_id = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
            [folderId || null, fileId, userId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error moving file:', error);
        res.status(500).json({ error: 'Failed to move file' });
    }
});

// DELETE /api/media/:id - Delete media file (RESTORED)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const fileId = req.params.id;

        // Get file info first
        const fileResult = await pool.query(
            `SELECT * FROM public.media_files WHERE id = $1 AND user_id = $2`,
            [fileId, userId]
        );

        if (fileResult.rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = fileResult.rows[0];
        const relativePath = file.external_id;

        await pool.query('DELETE FROM public.media_files WHERE id = $1', [fileId]);

        if (relativePath) {
            const filePath = path.join(UPLOAD_ROOT, relativePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ Deleted file: ${filePath}`);
            }
        }

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

export default router;
