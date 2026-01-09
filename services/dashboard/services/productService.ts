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
        // Create a copy without ID and created_at
        const { id, created_at, updated_at, ...rest } = product;

        // Handle image_url vs imageUrl for creation if needed
        // Assuming create expects imageUrl if it was mapped, but here we just pass rest.
        // API controller line 27 reads imageUrl. But our product has image_url.
        // We need to map it back if we want to preserve the image.
        const productData: any = { ...rest };
        if (product.image_url) {
            productData.imageUrl = product.image_url;
        }

        const newProduct = {
            ...productData,
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
