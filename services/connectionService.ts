import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface Connection {
    id?: string;
    user_id?: string;
    platform: string;
    shop_url?: string;
    name?: string;
    url?: string;
    status?: string;
    api_key?: string;
    created_at?: string;
}

async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` };
    }
    return {};
}

export const connectionService = {
    async getConnections(): Promise<Connection[]> {
        try {
            const headers = await getAuthHeaders();
            const response = await axios.get(`${API_URL}/api/connections`, { headers });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch connections:', error);
            return [];
        }
    },

    async addConnection(connection: Connection): Promise<Connection> {
        const headers = await getAuthHeaders();
        const response = await axios.post(`${API_URL}/api/connections`, connection, { headers });
        return response.data;
    },

    async deleteConnection(id: string): Promise<void> {
        const headers = await getAuthHeaders();
        await axios.delete(`${API_URL}/api/connections/${id}`, { headers });
    }
};
