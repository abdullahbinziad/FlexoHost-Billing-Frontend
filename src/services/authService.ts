/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient, ApiResponse } from '@/lib/apiClient';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: 'client' | 'admin';
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface LoginResponse {
    user: AuthUser;
    tokens: AuthTokens;
}

export interface VerifyResponse {
    user: AuthUser;
    valid: boolean;
}

export interface ResetPasswordData {
    email: string;
}

export interface ResetPasswordConfirmData {
    token: string;
    password: string;
    confirmPassword: string;
}

class AuthService {
    /**
     * Login user with email and password
     */
    async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
        return apiClient.post<LoginResponse>('/auth/login', credentials);
    }

    /**
     * Register new user
     */
    async register(data: RegisterData): Promise<ApiResponse<LoginResponse>> {
        return apiClient.post<LoginResponse>('/auth/register', data);
    }

    /**
     * Verify authentication token
     */
    async verifyToken(): Promise<ApiResponse<VerifyResponse>> {
        return apiClient.get<VerifyResponse>('/auth/verify');
    }

    /**
     * Logout user (invalidate token on server)
     */
    async logout(): Promise<ApiResponse<void>> {
        return apiClient.post<void>('/auth/logout');
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
        return apiClient.post<AuthTokens>('/auth/refresh', { refreshToken });
    }

    /**
     * Request password reset
     */
    async requestPasswordReset(data: ResetPasswordData): Promise<ApiResponse<void>> {
        return apiClient.post<void>('/auth/forgot-password', data);
    }

    /**
     * Reset password with token
     */
    async resetPassword(data: ResetPasswordConfirmData): Promise<ApiResponse<void>> {
        return apiClient.post<void>('/auth/reset-password', data);
    }

    /**
     * Change password (authenticated user)
     */
    async changePassword(
        currentPassword: string,
        newPassword: string
    ): Promise<ApiResponse<void>> {
        return apiClient.post<void>('/auth/change-password', {
            currentPassword,
            newPassword,
        });
    }
}

// Export singleton instance
export const authService = new AuthService();
