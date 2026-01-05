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
