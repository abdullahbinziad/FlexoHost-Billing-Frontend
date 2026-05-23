/**
 * Token Management Utilities
 * Handles secure token storage and retrieval
 */

import { devLog } from '@/lib/devLog';

const TOKEN_KEYS = {
    ACCESS_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
} as const;

/**
 * Cookie Options
 */
interface CookieOptions {
    maxAge?: number;
    path?: string;
    sameSite?: 'Strict' | 'Lax' | 'None';
    secure?: boolean;
}

/**
 * Set a cookie
 */
export function setCookie(
    name: string,
    value: string,
    options: CookieOptions = {}
): void {
    if (typeof window === 'undefined') return;

    const {
        maxAge = 86400, // 24 hours default
        path = '/',
        sameSite = 'Lax', // Changed to Lax to support returning from payment gateways cleanly
        secure = process.env.NODE_ENV === 'production',
    } = options;

    let cookie = `${name}=${value}; path=${path}; max-age=${maxAge}; SameSite=${sameSite}`;

    if (secure) {
        cookie += '; Secure';
    }

    document.cookie = cookie;
}

/**
 * Get a cookie value
 */
export function getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;

    const value = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${name}=`))
        ?.split('=')[1];

    return value || null;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string): void {
    if (typeof window === 'undefined') return;

    document.cookie = `${name}=; path=/; max-age=0`;
}

/**
 * Set access token
 */
export function setAccessToken(token: string, maxAge: number = 86400): void {
    setCookie(TOKEN_KEYS.ACCESS_TOKEN, token, { maxAge });
}

/**
 * Get access token
 */
export function getAccessToken(): string | null {
    return getCookie(TOKEN_KEYS.ACCESS_TOKEN);
}

/**
 * Set refresh token
 */
export function setRefreshToken(token: string, maxAge: number = 604800): void {
    setCookie(TOKEN_KEYS.REFRESH_TOKEN, token, { maxAge });
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
    return getCookie(TOKEN_KEYS.REFRESH_TOKEN);
}

/**
 * Clear all auth tokens
 */
export function clearAuthTokens(): void {
    deleteCookie(TOKEN_KEYS.ACCESS_TOKEN);
    deleteCookie(TOKEN_KEYS.REFRESH_TOKEN);
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
    return !!getAccessToken();
}

/**
 * Parse JWT token (without verification)
 * Note: This is for client-side display only, not for security
 */
export function parseJWT(token: string): any {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        devLog('Failed to parse JWT:', error);
        return null;
    }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
    try {
        const payload = parseJWT(token);
        if (!payload || !payload.exp) return true;

        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch (error) {
        return true;
    }
}

/**
 * Get token expiration time in seconds
 */
export function getTokenExpiration(token: string): number | null {
    try {
        const payload = parseJWT(token);
        return payload?.exp || null;
    } catch (error) {
        return null;
    }
}
