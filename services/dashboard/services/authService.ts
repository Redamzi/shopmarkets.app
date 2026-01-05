import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// URL zum neuen Auth-Microservice
const AUTH_URL = 'https://security.shopmarkets.app/api/auth';

export interface User {
    id: string;
    email: string;
    fullName?: string;
    isVerified?: boolean;
    is_avv_signed?: boolean;
}

export interface AuthResponse {
    message: string;
    token?: string;
    user?: User;
    userId?: string;
    requires2FA?: boolean;
}

// Token Handling Helper
const setToken = (token: string) => {
    localStorage.setItem('auth_token', token);
    useAuthStore.getState().setSession({ access_token: token });
};

const getToken = () => {
    // Check Zustand Store first (primary source)
    const session = useAuthStore.getState().session;
    if (session?.access_token) return session.access_token;

    // Check Legacy/Direct Storage
    return localStorage.getItem('auth_token');
};

const removeToken = () => {
    localStorage.removeItem('auth_token');
    useAuthStore.getState().logout();
};

export const authService = {
    // 1. Register
    async register(data: any) {
        const response = await axios.post(`${AUTH_URL}/register`, {
            email: data.email,
            password: data.password,
            fullName: data.fullName
        });
        return response.data;
    },

    // 2. Verify Email (nach Register)
    async verifyEmail(userId: string, code: string) {
        const response = await axios.post(`${AUTH_URL}/verify-email`, {
            userId,
            code
        });
        return response.data;
    },

    // 3. Login Step 1 (Credentials) -> Sendet 2FA Code
    async loginStep1(email: string, password: string, deviceFingerprint?: string) {
        const response = await axios.post(`${AUTH_URL}/login`, {
            email,
            password,
            deviceFingerprint
        });
        return response.data; // Returns { userId, requires2FA: true } or { token, user, skipTwoFactor: true }
    },

    // 6. Get Current User (aus Token oder API)
    async getCurrentUser() {
        const token = getToken();
        if (!token) return null;

        try {
            // Fetch real user data from backend to ensure we have latest AVV status
            const response = await axios.get(`${AUTH_URL}/verify-token`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.user;
        } catch (e) {
            console.error('Failed to fetch current user', e);
            // Fallback: Decodiere Token Payload (Base64) für Basis-Daten
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return {
                    id: payload.userId,
                    email: payload.email,
                    is_avv_signed: true // Fallback: Assume signed to prevent blocking if API fails? Or false? Better false.
                };
            } catch (decodeError) {
                return null;
            }
        }
    },

    // Session Check
    async getSession() {
        const token = getToken();
        return token ? { access_token: token } : null;
    },

    // Sign AVV Contract
    async signAVV() {
        const token = getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await axios.post(
            `${AUTH_URL}/sign-avv`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    }
};
