import { storage } from '../utils/storage';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.shopmarkets.app';

export const categoryService = {
    getAll: async () => {
        const token = storage.getItem('auth_token');
        const response = await axios.get(`${API_URL}/api/categories`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    create: async (data: any) => {
        const token = storage.getItem('auth_token');
        const response = await axios.post(`${API_URL}/api/categories`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
