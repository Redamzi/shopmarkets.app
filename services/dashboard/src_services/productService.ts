import axios from 'axios';
import { Product } from '../types';
import { supabase } from '../lib/supabase';

// Nutze die Backend-API (die du gerade deployt hast)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Helper to get auth headers
async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` };
    }
    return {};
}

export const productService = {
    async getProducts(): Promise<Product[]> {
        try {
            const headers = await getAuthHeaders();
            const response = await axios.get(`${API_URL}/api/products`, { headers });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch products:', error);
            return []; // Leeres Array bei Fehler
        }
    },

    async createProduct(product: Product): Promise<Product> {
        const headers = await getAuthHeaders();
        const response = await axios.post(`${API_URL}/api/products`, product, { headers });
        return response.data;
    }
};
