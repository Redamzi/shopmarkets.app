import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { User, AuthResponse } from '../types/auth';
import { storage } from '../utils/storage';

// URL zum neuen Auth-Microservice
const AUTH_URL = 'https://security.shopmarkets.app/api/auth';

// Token Handling Helper
const setToken = (token: string) => {
    storage.setItem('auth_token', token);
    useAuthStore.getState().setSession({ access_token: token });
};

const getToken = () => {
    // Check Zustand Store first (primary source)
    const session = useAuthStore.getState().session;
    if (session?.access_token) return session.access_token;

    // Check Legacy/Direct Storage
    return storage.getItem('auth_token');
};

const removeToken = () => {
    try {
        storage.removeItem('auth_token');
        // Try to clear Zustand store, but don't block if it fails
        useAuthStore.getState().logout();
    } catch (e) {
        console.error('Store logout failed, but token removed:', e);
    }
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

    // 4. Login Step 2 (Verify 2FA Code)
    async loginStep2(userId: string, code: string, trustDevice: boolean, deviceFingerprint?: string) {
        const response = await axios.post(`${AUTH_URL}/verify-2fa`, {
            userId,
            code,
            trustDevice,
            deviceFingerprint
        });

        if (response.data.token) {
            setToken(response.data.token);
        }

        return response.data;
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
        } catch (e: any) {
            console.error('Failed to fetch current user', e);

            // If token is invalid/expired (401 or 403), force logout logic
            if (e.response && (e.response.status === 401 || e.response.status === 403)) {
                removeToken();
                return null;
            }

            // Only fallback if it's a network error or server error (500), NOT if it's an auth error
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return {
                    id: payload.userId,
                    email: payload.email,
                    is_avv_signed: true
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
    },

    // 5. Logout
    async logout() {
        try {
            removeToken();
        } catch (e) {
            console.error('Logout error:', e);
            // Fallback: Ensure clear manually
            localStorage.removeItem('auth_token');
        } finally {
            // Always redirect
            window.location.href = '/login';
        }
    },

    // Update Password - Placeholder for now
    async updatePassword(password: string) {
        // Implement backend call here later
        console.log('Update password not implemented yet', password);
        return true;
    }
};
