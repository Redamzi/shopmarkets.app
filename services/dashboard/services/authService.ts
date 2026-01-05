import axios from 'axios';

// URL zum neuen Auth-Microservice
const AUTH_URL = 'https://security.shopmarkets.app/api/auth';

export interface User {
    id: string;
    email: string;
    fullName?: string;
    isVerified?: boolean;
    avvAccepted?: boolean;
}

export interface AuthResponse {
    message: string;
    token?: string;
    user?: User;
    userId?: string;
    requires2FA?: boolean;
}

// Token Handling Helper
const setToken = (token: string) => localStorage.setItem('auth_token', token);
const getToken = () => localStorage.getItem('auth_token');
const removeToken = () => localStorage.removeItem('auth_token');

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
    async loginStep1(email: string, password: string) {
        const response = await axios.post(`${AUTH_URL}/login`, {
            email,
            password
        });
        return response.data; // Returns { userId, requires2FA: true } or { token, user, skipTwoFactor: true }
    },

    // 4. Login Step 2 (Verifies Code) -> Gibt Token zurück
    async loginStep2(userId: string, code: string, trustDevice: boolean = false, deviceFingerprint?: string) {
        const response = await axios.post(`${AUTH_URL}/verify-2fa`, {
            userId,
            code,
            trustDevice,
            deviceFingerprint
        });

        if (response.data.token) {
            setToken(response.data.token);
            // Default User Object für den Store
            return {
                user: response.data.user,
                session: { access_token: response.data.token }
            };
        }
        return response.data;
    },

    // 5. Logout
    async logout() {
        removeToken();
        window.location.href = '/login';
    },

    // 6. Get Current User (aus Token oder API)
    async getCurrentUser() {
        const token = getToken();
        if (!token) return null;

        // Hier könnten wir einen /me Endpoint aufrufen
        // Simuliert User aus Token/Storage für Performance
        try {
            // Decodiere Token Payload (Base64)
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                id: payload.userId,
                email: payload.email,
                // fullName müsste vom /me endpoint kommen, wir nehmen placeholder oder session storage
            };
        } catch (e) {
            return null;
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
