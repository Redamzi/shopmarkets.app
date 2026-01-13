import axios from 'axios';
import { storage } from '../utils/storage';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.shopmarkets.app';

export const mediaService = {
    getAll: async (folderId?: string) => {
        const token = storage.getItem('auth_token');
        const params = folderId ? { folderId } : {};
        const response = await axios.get(`${API_URL}/api/media`, {
            headers: { Authorization: `Bearer ${token}` },
            params
        });
        return response.data;
    },

    getFolders: async () => {
        const token = storage.getItem('auth_token');
        const response = await axios.get(`${API_URL}/api/media/folders`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    upload: async (formData: FormData) => {
        const token = storage.getItem('auth_token');
        const response = await axios.post(`${API_URL}/api/media/upload`, formData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    delete: async (id: string) => {
        const token = storage.getItem('auth_token');
        const response = await axios.delete(`${API_URL}/api/media/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    createFolder: async (name: string) => {
        const token = storage.getItem('auth_token');
        const response = await axios.post(`${API_URL}/api/media/folders`, { name }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    deleteFolder: async (id: string) => {
        const token = storage.getItem('auth_token');
        const response = await axios.delete(`${API_URL}/api/media/folders/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    updateFolder: async (id: string, name: string) => {
        const token = storage.getItem('auth_token');
        const response = await axios.put(`${API_URL}/api/media/folders/${id}`, { name }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    moveFile: async (fileId: string, folderId: string | null) => {
        const token = storage.getItem('auth_token');
        const response = await axios.put(`${API_URL}/api/media/${fileId}/move`, { folderId }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    testConnection: async () => {
        // Deprecated / Not used for local storage, but kept for compatibility
        return { message: "Local Storage Mode Active" };
    }
};
