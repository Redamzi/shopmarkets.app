import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.shopmarkets.app';

export const mediaService = {
    getAll: async (folderId?: string) => {
        const token = localStorage.getItem('auth_token');
        const params = folderId ? { folderId } : {};
        const response = await axios.get(`${API_URL}/api/media`, {
            headers: { Authorization: `Bearer ${token}` },
            params
        });
        return response.data;
    },

    getFolders: async () => {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get(`${API_URL}/api/media/folders`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    upload: async (file: File) => {
        const token = localStorage.getItem('auth_token');

        // Step 1: Get pre-signed URL from backend
        const uploadRequest = await axios.post(`${API_URL}/api/media/upload`, {
            fileName: file.name,
            fileType: file.type
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const { uploadUrl, key, publicUrl } = uploadRequest.data;

        // Step 2: Upload directly to R2 using pre-signed URL
        const startTime = Date.now();
        await axios.put(uploadUrl, file, {
            headers: {
                'Content-Type': file.type
            }
        });
        const uploadDuration = Date.now() - startTime;

        // Step 3: Confirm upload and save metadata
        const confirmResponse = await axios.post(`${API_URL}/api/media/confirm`, {
            key,
            title: file.name,
            fileSize: file.size,
            uploadDuration
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return confirmResponse.data;
    },

    testConnection: async () => {
        const token = localStorage.getItem('auth_token');
        try {
            const response = await axios.get(`${API_URL}/api/media/test-connection`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            throw error.response ? error.response.data : error;
        }
    }
};
