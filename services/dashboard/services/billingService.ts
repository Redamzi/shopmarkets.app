import { storage } from '../utils/storage';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.shopmarkets.app';

export interface UserCredits {
    id: string;
    user_id: string;
    credits: number;
    plan: string; // 'free', 'pro', etc.
}

export const billingService = {
    async getCredits(userId: string): Promise<UserCredits> {
        try {
            const token = storage.getItem('auth_token');
            const response = await axios.get(`${API_URL}/api/billing/credits/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch credits:', error);
            // Fallback
            return { id: '', user_id: userId, credits: 0, plan: 'free' };
        }
    }
};
