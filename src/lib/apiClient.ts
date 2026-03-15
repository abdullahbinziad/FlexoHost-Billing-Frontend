/**
 * API Client Configuration
 * Centralized HTTP client for all API requests
 */

import { API_CONFIG } from '@/config/api';
import { getAccessToken } from '@/utils/tokenManager';
import { getCsrfToken } from '@/lib/csrfToken';
import { devLog } from '@/lib/devLog';

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

    /** Resolve API URL - use as-is if absolute, otherwise resolve relative to current origin */
    private getRequestUrl(endpoint: string): string {
        const path = `${this.baseURL.replace(/\/$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        if (typeof window !== 'undefined') {
            return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;
        }
        const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return `${origin.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
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
            const [token, csrfToken] = await Promise.all([
                Promise.resolve(this.getAuthToken()),
                getCsrfToken(),
            ]);
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
            if (csrfToken) {
                headers['X-CSRF-Token'] = csrfToken;
            }

            const response = await fetch(this.getRequestUrl(endpoint), {
                ...options,
                headers,
                credentials: 'include',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Read body as text first to avoid json() throwing on empty/invalid body
            const text = await response.text();
            let data: any = {};
            const contentType = response.headers.get('content-type');

            if (text) {
                if (contentType?.includes('application/json')) {
                    try {
                        data = JSON.parse(text);
                    } catch (parseError) {
                        devLog('Failed to parse JSON response:', parseError);
                        data = { message: text };
                    }
                } else {
                    data = { message: text };
                }
            }

            if (!response.ok) {
                // Handle different error status codes
                let errorMessage = data.message || 'Request failed';

                if (response.status === 403) {
                    if (typeof data.message === 'string' && data.message.toLowerCase().includes('csrf')) {
                        errorMessage = data.message;
                    } else {
                        errorMessage = 'Access forbidden. Your session may have expired or is invalid. Please log out and log in again.';
                    }
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

            // Handle network errors (Failed to fetch, CORS, connection refused, etc.)
            const msg = error?.message || '';
            if (
                error instanceof TypeError ||
                msg.includes('fetch') ||
                msg.includes('NetworkError') ||
                msg.includes('Failed to fetch')
            ) {
                const apiUrl = this.baseURL.startsWith('http')
                    ? this.baseURL
                    : typeof window !== 'undefined'
                        ? `${window.location.origin}${this.baseURL}`
                        : this.baseURL;
                throw {
                    message: `Cannot connect to backend. Ensure it is running at ${apiUrl}`,
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
export const apiClient = new ApiClient(
    API_CONFIG.BASE_URL ?? '',
    API_CONFIG.TIMEOUT ?? 30000
);

