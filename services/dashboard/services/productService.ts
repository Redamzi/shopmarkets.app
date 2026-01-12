import axios from 'axios';
import { Product } from '../types';
import { authService } from './authService';

// Nutze die Backend-API (die du gerade deployt hast)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Helper to get auth headers
async function getAuthHeaders() {
    const session = await authService.getSession();
    if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` };
    }
    return {};
}

export const productService = {
    async getProducts(): Promise<Product[]> {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${API_URL}/api/products`, { headers });
        return response.data;
    },

    async getProductById(id: string): Promise<Product> {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${API_URL}/api/products/${id}`, { headers });
        return response.data;
    },

    async createProduct(product: Product): Promise<Product> {
        const headers = await getAuthHeaders();
        const response = await axios.post(`${API_URL}/api/products`, product, { headers });
        return response.data;
    },

    async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
        const headers = await getAuthHeaders();
        const response = await axios.patch(`${API_URL}/api/products/${id}`, updates, { headers });
        return response.data;
    },

    async duplicateProduct(product: Product): Promise<Product> {
        // Create a copy without ID and timestamps
        const { id, created_at, updated_at, ...rest } = product;

        const newProduct = {
            ...rest,
            title: `${product.title} (Kopie)`,
            sku: `${product.sku}-copy-${Date.now().toString().slice(-4)}`
        };
        return this.createProduct(newProduct as Product);
    },

    async deleteProduct(id: string): Promise<void> {
        const headers = await getAuthHeaders();
        await axios.delete(`${API_URL}/api/products/${id}`, { headers });
    }
};
