import { supabase } from '../lib/supabase';
import axios from 'axios';

const SECURITY_SERVICE_URL = import.meta.env.VITE_SECURITY_SERVICE_URL || 'https://security.shopmarkets.app';

export interface SignUpData {
    email: string;
    password: string;
    fullName: string;
}

export interface SignInData {
    email: string;
    password: string;
}

export interface TwoFactorSetupResponse {
    secret: string;
    qrCode: string;
    backupCodes: string[];
}

export const authService = {
    // Sign Up
    async signUp(data: SignUpData) {
        const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    full_name: data.fullName,
                },
            },
        });

        if (error) throw error;

        // Send verification email via Security Service
        if (authData.user) {
            await axios.post(`${SECURITY_SERVICE_URL}/api/auth/send-verification`, {
                userId: authData.user.id,
                email: data.email,
            });
        }

        return authData;
    },

    // Sign In
    async signIn(data: SignInData) {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });

        if (error) throw error;
        return authData;
    },

    // Sign Out
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Verify Email
    async verifyEmail(userId: string, code: string) {
        const response = await axios.post(`${SECURITY_SERVICE_URL}/api/auth/verify-email`, {
            userId,
            code,
        });
        return response.data;
    },

    // Resend Verification
    async resendVerification(userId: string, email: string) {
        const response = await axios.post(`${SECURITY_SERVICE_URL}/api/auth/resend-verification`, {
            userId,
            email,
        });
        return response.data;
    },

    // 2FA Setup
    async setup2FA(userId: string): Promise<TwoFactorSetupResponse> {
        const response = await axios.post(`${SECURITY_SERVICE_URL}/api/2fa/setup`, {
            userId,
        });
        return response.data;
    },

    // Enable 2FA
    async enable2FA(userId: string, code: string) {
        const response = await axios.post(`${SECURITY_SERVICE_URL}/api/2fa/enable`, {
            userId,
            code,
        });
        return response.data;
    },

    // Verify 2FA
    async verify2FA(userId: string, code: string) {
        const response = await axios.post(`${SECURITY_SERVICE_URL}/api/2fa/verify`, {
            userId,
            code,
        });
        return response.data;
    },

    // Disable 2FA
    async disable2FA(userId: string, password: string) {
        const response = await axios.post(`${SECURITY_SERVICE_URL}/api/2fa/disable`, {
            userId,
            password,
        });
        return response.data;
    },

    // Get Current User
    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // Get Session
    async getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    // Reset Password
    async resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
    },

    // Update Password
    async updatePassword(newPassword: string) {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });
        if (error) throw error;
    },
};
