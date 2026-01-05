import { uploadToR2 } from '../utils/r2.js';

export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imageUrl = await uploadToR2(req.file.buffer, req.file.originalname);
        res.json({ imageUrl });
    } catch (err) {
        console.error('uploadImage error:', err);
        res.status(500).json({ error: 'Failed to upload image' });
    }
};
