import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.shopmarkets.app';

export const categoryService = {
    getAll: async () => {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get(`${API_URL}/api/categories`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    create: async (data: any) => {
        const token = localStorage.getItem('auth_token');
        const response = await axios.post(`${API_URL}/api/categories`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
