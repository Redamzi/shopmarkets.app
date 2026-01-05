import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

export const uploadToR2 = async (fileBuffer, originalName) => {
    const fileExtension = originalName.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: `products/${fileName}`,
        Body: fileBuffer,
        ContentType: `image/${fileExtension}`,
    });

    await r2Client.send(command);

    // Return public URL
    return `${process.env.R2_PUBLIC_URL}/products/${fileName}`;
};
