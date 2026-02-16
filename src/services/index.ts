/**
 * Services Index
 * Central export point for all services
 */

export { authenticationService } from './authentication.service';
export { clientService } from './client.service';
export { authService } from './authService';

// Re-export types for convenience
export type {
    LoginCredentials,
    RegisterUserData,
    ClientRegistrationData,
    User,
    Client,
    AuthTokens,
} from '@/types/auth';
