/**
 * API Client Configuration
 * Centralized HTTP client for all API requests
 */

import { API_CONFIG } from '@/config/api';
import { getAccessToken } from '@/utils/tokenManager';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface ApiError {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
    originalError?: any;
}

class ApiClient {
    private baseURL: string;
    private timeout: number;

    constructor(baseURL: string, timeout: number) {
        this.baseURL = baseURL;
        this.timeout = timeout;
    }

    /**
     * Get authentication token from cookies
     */
    private getAuthToken(): string | null {
        return getAccessToken();
    }

    /**
     * Make HTTP request with timeout and error handling
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const token = this.getAuthToken();
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            // Add custom headers from options
            if (options.headers) {
                const optionsHeaders = options.headers as Record<string, string>;
                Object.assign(headers, optionsHeaders);
            }

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Try to parse JSON response, handle empty responses
            let data: any = {};
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                try {
                    data = await response.json();
                } catch (parseError) {
                    console.error('Failed to parse JSON response:', parseError);
                    data = {};
                }
            } else {
                // Non-JSON response, try to get text
                const text = await response.text();
                if (text) {
                    data = { message: text };
                }
            }

            if (!response.ok) {
                // Handle different error status codes
                let errorMessage = data.message || 'Request failed';

                if (response.status === 403) {
                    errorMessage = 'Access forbidden. Your session may have expired or is invalid. Please log out and log in again.';
                } else if (response.status === 404) {
                    errorMessage = 'API endpoint not found. Please check the backend is running.';
                } else if (response.status === 500) {
                    errorMessage = 'Server error. Please check backend logs.';
                } else if (response.status === 0 || !response.status) {
                    errorMessage = 'Cannot connect to backend. Please ensure backend is running.';
                }

                throw {
                    message: errorMessage,
                    status: response.status,
                    errors: data.errors,
                    originalError: data,
                } as ApiError;
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message,
            };
        } catch (error: any) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw {
                    message: 'Request timeout. Backend took too long to respond.',
                    status: 408,
                } as ApiError;
            }

            // Handle network errors
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw {
                    message: 'Network error. Cannot connect to backend. Please ensure backend is running on ' + this.baseURL,
                    status: 0,
                } as ApiError;
            }

            throw error as ApiError;
        }
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    /**
     * POST request
     */
    async post<T>(
        endpoint: string,
        body?: any,
        options?: RequestInit
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    /**
     * PUT request
     */
    async put<T>(
        endpoint: string,
        body?: any,
        options?: RequestInit
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    /**
     * PATCH request
     */
    async patch<T>(
        endpoint: string,
        body?: any,
        options?: RequestInit
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

// Export singleton instance
export const apiClient = new ApiClient(API_CONFIG.BASE_URL, API_CONFIG.TIMEOUT);

