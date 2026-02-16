/**
 * Authentication Type Definitions
 */

import { UserRole } from '@/config/api';

/**
 * User Entity
 */
export interface User {
    _id: string;
    name: string;
    email: string;
    username?: string;
    role: UserRole;
    isActive: boolean;
    isEmailVerified: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    phone?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
}

/**
 * Client Entity
 */
export interface Client {
    _id: string;
    user: string | User;
    firstName: string;
    lastName: string;
    companyName?: string;
    contactEmail?: string;
    phoneNumber?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postCode?: string;
        country?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Authentication Tokens
 */
export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
}

/**
 * Login Credentials
 */
export interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Login Response
 */
export interface LoginResponse {
    user: User;
    accessToken: string;
    message?: string;
}

/**
 * Register Data (Simple User)
 */
export interface RegisterUserData {
    name: string;
    email: string;
    password: string;
    username?: string;
}

/**
 * Client Registration Data
 */
export interface ClientRegistrationData {
    userData: {
        email: string;
        password: string;
        username?: string;
    };
    clientData: {
        firstName: string;
        lastName: string;
        companyName?: string;
        contactEmail?: string;
        phoneNumber?: string;
        address?: {
            street?: string;
            city?: string;
            state?: string;
            postCode?: string;
            country?: string;
        };
    };
}

/**
 * Client Registration Response
 */
export interface ClientRegistrationResponse {
    client: Client;
    user: User;
    accessToken: string;
    message?: string;
}

/**
 * Change Password Data
 */
export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

/**
 * Forgot Password Data
 */
export interface ForgotPasswordData {
    email: string;
}

/**
 * Reset Password Data
 */
export interface ResetPasswordData {
    token: string;
    password: string;
    confirmPassword: string;
}

/**
 * Verify Token Response
 */
export interface VerifyTokenResponse {
    user: User;
    valid: boolean;
}

/**
 * Auth Context State
 */
export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

/**
 * Auth Context Actions
 */
export interface AuthActions {
    login: (email: string, password: string, redirectUrl?: string) => Promise<void>;
    register: (data: RegisterUserData) => Promise<void>;
    registerClient: (data: ClientRegistrationData) => Promise<void>;
    logout: () => Promise<void>;
    changePassword: (data: ChangePasswordData) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (data: ResetPasswordData) => Promise<void>;
    refreshToken: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

/**
 * Complete Auth Context Type
 */
export type AuthContextType = AuthState & AuthActions;
