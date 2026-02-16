/**
 * Client Registration Service
 * Handles client-specific registration with complete profile data
 */

import { apiClient, ApiResponse } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api';
import type {
    ClientRegistrationData,
    ClientRegistrationResponse,
    Client,
} from '@/types/auth';

/**
 * Client Service Class
 */
class ClientService {
    /**
     * Register new client with complete profile
     */
    async registerClient(
        data: ClientRegistrationData
    ): Promise<ApiResponse<ClientRegistrationResponse>> {
        try {
            const response = await apiClient.post<ClientRegistrationResponse>(
                API_ENDPOINTS.CLIENTS.REGISTER,
                data
            );
            return response;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Get client profile
     */
    async getClientProfile(): Promise<ApiResponse<Client>> {
        try {
            const response = await apiClient.get<Client>(
                API_ENDPOINTS.CLIENTS.ME
            );
            return response;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Update client profile
     */
    async updateClientProfile(data: Partial<Client>): Promise<ApiResponse<Client>> {
        try {
            const response = await apiClient.patch<Client>(
                API_ENDPOINTS.CLIENTS.ME,
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

        // Log error for debugging
        console.error('Client API Error:', { message, status, error });

        return new Error(message);
    }
}

// Export singleton instance
export const clientService = new ClientService();
