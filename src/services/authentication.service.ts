/**
 * Authentication API Service
 * Handles all authentication-related API calls with proper backend integration
 */

import { apiClient, ApiResponse } from '@/lib/apiClient';
import { devLog } from '@/lib/devLog';
import { API_ENDPOINTS } from '@/config/api';
import type {
    LoginCredentials,
    LoginResponse,
    RegisterUserData,
    ChangePasswordData,
    ForgotPasswordData,
    ResetPasswordData,
    VerifyTokenResponse,
    AuthTokens,
} from '@/types/auth';

/**
 * Authentication Service Class
 */
class AuthenticationService {
    /**
     * Login user with email and password
     */
    async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
        try {
            const response = await apiClient.post<LoginResponse>(
                API_ENDPOINTS.AUTH.LOGIN,
                credentials
            );
            return response;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Register new user (simple registration)
     */
    async register(data: RegisterUserData): Promise<ApiResponse<LoginResponse>> {
        try {
            const response = await apiClient.post<LoginResponse>(
                API_ENDPOINTS.AUTH.REGISTER,
                data
            );
            return response;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Logout user (invalidate token on server)
     */
    async logout(): Promise<ApiResponse<void>> {
        try {
            const response = await apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT);
            return response;
        } catch (error: any) {
            // Don't throw error on logout failure
            devLog('Logout API error:', error);
            return { success: false, message: 'Logout failed' };
        }
    }

    /**
     * Get current authenticated user
     */
    async getCurrentUser(): Promise<ApiResponse<VerifyTokenResponse>> {
        try {
            const response = await apiClient.get<VerifyTokenResponse>(
                API_ENDPOINTS.AUTH.ME
            );
            return response;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Update current user profile
     */
    async updateProfile(data: any): Promise<ApiResponse<any>> {
        try {
            const response = await apiClient.patch<any>(
                API_ENDPOINTS.USERS.PROFILE,
                data
            );
            return response;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Verify authentication token
     */
    async verifyToken(): Promise<ApiResponse<VerifyTokenResponse>> {
        try {
            const response = await apiClient.get<VerifyTokenResponse>(
                API_ENDPOINTS.AUTH.ME
            );
            return response;
        } catch (error: any) {
            // 401 = not logged in (expected on /login) - return clean response, don't throw
            if (error?.status === 401) {
                return { success: false, data: undefined };
            }
            throw this.handleError(error);
        }
    }

    /**
     * Refresh access token. Pass refreshToken when using token-based auth;
     * when using cookie-only auth, omit it and the cookie will be sent via credentials.
     */
    async refreshToken(refreshToken?: string): Promise<ApiResponse<AuthTokens>> {
        try {
            const response = await apiClient.post<AuthTokens>(
                API_ENDPOINTS.AUTH.REFRESH_TOKEN,
                refreshToken ? { refreshToken } : {}
            );
            return response;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Change password (authenticated user)
     */
    async changePassword(data: ChangePasswordData): Promise<ApiResponse<void>> {
        try {
            const response = await apiClient.patch<void>(
                API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
                data
            );
            return response;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Request password reset
     */
    async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse<{ resetToken?: string }>> {
        try {
            const response = await apiClient.post<{ resetToken?: string }>(
                API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
                data
            );
            return response;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Reset password with token
     */
    async resetPassword(data: ResetPasswordData): Promise<ApiResponse<void>> {
        try {
            const response = await apiClient.post<void>(
                API_ENDPOINTS.AUTH.RESET_PASSWORD,
                data
            );
            return response;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Handle API errors
     */
    private handleError(error: any): Error {
        const message = error?.message || 'An unexpected error occurred';
        const status = error?.status || 500;

        // Don't log 401 - expected when not logged in
        if (status !== 401) {
            devLog('Auth API Error:', { message, status, name: error?.name });
        }

        return new Error(message);
    }
}

// Export singleton instance
export const authenticationService = new AuthenticationService();
