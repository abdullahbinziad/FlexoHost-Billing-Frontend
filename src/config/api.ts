/**
 * API Configuration
 * Centralized API endpoint configuration
 */

export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1',
    TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
    VERSION: 'v1',
} as const;

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        ME: '/auth/me',
        REFRESH_TOKEN: '/auth/refresh-token',
        CHANGE_PASSWORD: '/auth/change-password',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
    },

    // Client Management
    CLIENTS: {
        REGISTER: '/clients/register',
        ME: '/clients/me',
        UPDATE: '/clients/update',
    },

    // User Management
    USERS: {
        LIST: '/users',
        GET: (id: string) => `/users/${id}`,
        UPDATE: (id: string) => `/users/${id}`,
        DELETE: (id: string) => `/users/${id}`,
        PROFILE: '/users/me',
    },
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    LOCKED: 423,
    TOO_MANY_REQUESTS: 429,
    SERVER_ERROR: 500,
} as const;

/**
 * User Roles
 */
export const USER_ROLES = {
    SUPERADMIN: 'superadmin',
    ADMIN: 'admin',
    STAFF: 'staff',
    CLIENT: 'client',
    USER: 'user',
    MODERATOR: 'moderator',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
