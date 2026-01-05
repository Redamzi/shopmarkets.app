import express from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    },
});

router.post('/image', upload.single('image'), uploadImage);

export default router;
