/**
 * API / App config – only this file reads process.env for URLs.
 * Rest of the app must use API_CONFIG (never process.env for URLs).
 */
function getBackendOrigin(): string {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!url) return '';
    try {
        return new URL(url).origin;
    } catch {
        return '';
    }
}

function getAppOrigin(): string {
    const url = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL;
    if (!url) return '';
    try {
        return new URL(url).origin;
    } catch {
        return '';
    }
}

const BACKEND_ORIGIN = getBackendOrigin();
const APP_ORIGIN = getAppOrigin();

export const BACKEND_API_BASE = BACKEND_ORIGIN ? `${BACKEND_ORIGIN}/api/v1` : '';

export const API_CONFIG = {
    BASE_URL: BACKEND_API_BASE || '/api/v1',
    BACKEND_ORIGIN,
    BACKEND_API_BASE,
    APP_ORIGIN,
    TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
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
        /** Full URL to start Google OAuth (redirects to backend). */
        GOOGLE: '/api/v1/auth/google',
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
