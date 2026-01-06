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
    }
};
