import axios from 'axios';
import { Product } from '../types';

// Nutze die Backend-API (die du gerade deployt hast)
const API_URL = import.meta.env.VITE_API_URL || 'https://api.shopmarkets.app';

export const productService = {
    async getProducts(): Promise<Product[]> {
        try {
            const response = await axios.get(`${API_URL}/api/products`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch products:', error);
            return []; // Leeres Array bei Fehler
        }
    },

    async createProduct(product: Partial<Product>): Promise<Product> {
        const response = await axios.post(`${API_URL}/api/products`, product);
        return response.data;
    }
};
