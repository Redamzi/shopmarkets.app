import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.shopmarkets.app';

export interface Connection {
    id?: string;
    platform: string; // 'shopify', 'ebay', 'amazon'
    shop_url?: string;
    api_key?: string;
    status: 'active' | 'error' | 'disconnected';
    last_sync_at?: string;
    user_id?: string;
}

export const connectionService = {
    async getConnections(): Promise<Connection[]> {
        try {
            const response = await axios.get(`${API_URL}/api/connections`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch connections:', error);
            return [];
        }
    },

    async addConnection(connection: Connection): Promise<Connection> {
        const response = await axios.post(`${API_URL}/api/connections`, connection);
        return response.data;
    },

    async deleteConnection(id: string): Promise<void> {
        await axios.delete(`${API_URL}/api/connections/${id}`);
    }
};
