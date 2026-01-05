import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { generateProductFromImage } from '../controllers/magicController.js';

const router = express.Router();

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// POST /
router.post('/', upload.single('image'), generateProductFromImage);

export default router;
