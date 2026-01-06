import { storage } from '../utils/storage';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.shopmarkets.app';

export interface SyncLog {
    id: string;
    platform: string;
    status: 'success' | 'failed' | 'running';
    started_at: string;
    completed_at?: string;
    products_synced: number;
    details?: string;
}

export const syncService = {
    async getLogs(): Promise<SyncLog[]> {
        try {
            const token = storage.getItem('auth_token');
            const response = await axios.get(`${API_URL}/api/sync/logs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch sync logs:', error);
            return [];
        }
    }
};
