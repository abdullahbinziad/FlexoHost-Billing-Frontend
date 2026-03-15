/**
 * Security Utilities
 * Provides security-related functions for the application
 */

/**
 * Rate Limiter
 * Simple in-memory rate limiter for client-side protection
 */
class RateLimiter {
    private attempts: Map<string, { count: number; resetTime: number }> = new Map();
    private readonly maxAttempts: number;
    private readonly windowMs: number;

    constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
    }

    /**
     * Check if the identifier has exceeded the rate limit
     */
    isRateLimited(identifier: string): boolean {
        const now = Date.now();
        const record = this.attempts.get(identifier);

        if (!record) {
            return false;
        }

        // Reset if window has passed
        if (now > record.resetTime) {
            this.attempts.delete(identifier);
            return false;
        }

        return record.count >= this.maxAttempts;
    }

    /**
     * Record an attempt for the identifier
     */
    recordAttempt(identifier: string): void {
        const now = Date.now();
        const record = this.attempts.get(identifier);

        if (!record || now > record.resetTime) {
            this.attempts.set(identifier, {
                count: 1,
                resetTime: now + this.windowMs,
            });
        } else {
            record.count++;
        }
    }

    /**
     * Get remaining attempts for the identifier
     */
    getRemainingAttempts(identifier: string): number {
        const record = this.attempts.get(identifier);
        if (!record || Date.now() > record.resetTime) {
            return this.maxAttempts;
        }
        return Math.max(0, this.maxAttempts - record.count);
    }

    /**
     * Get time until reset in milliseconds
     */
    getTimeUntilReset(identifier: string): number {
        const record = this.attempts.get(identifier);
        if (!record) {
            return 0;
        }
        return Math.max(0, record.resetTime - Date.now());
    }

    /**
     * Clear attempts for an identifier
     */
    clearAttempts(identifier: string): void {
        this.attempts.delete(identifier);
    }
}

// Export singleton instances for different use cases
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const apiRateLimiter = new RateLimiter(100, 15 * 60 * 1000); // 100 requests per 15 minutes

/**
 * Password Strength Validator
 */
export interface PasswordStrength {
    score: number; // 0-4
    feedback: string[];
    isStrong: boolean;
}

export function validatePasswordStrength(password: string): PasswordStrength {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    else if (password.length < 8) {
        feedback.push("Password should be at least 8 characters long");
    }

    // Complexity checks
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
        score++;
    } else {
        feedback.push("Use both uppercase and lowercase letters");
    }

    if (/\d/.test(password)) {
        score++;
    } else {
        feedback.push("Include at least one number");
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        score++;
    } else {
        feedback.push("Include at least one special character");
    }

    // Common patterns check
    const commonPatterns = [
        /^123456/,
        /^password/i,
        /^qwerty/i,
        /^abc123/i,
        /^111111/,
    ];

    if (commonPatterns.some((pattern) => pattern.test(password))) {
        score = Math.max(0, score - 2);
        feedback.push("Avoid common password patterns");
    }

    return {
        score: Math.min(4, score),
        feedback,
        isStrong: score >= 3,
    };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Generate a secure random token (client-side)
 */
export function generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Check if cookie is secure (HTTPS only in production)
 */
export function shouldUseSecureCookies(): boolean {
    return process.env.NODE_ENV === "production" && window.location.protocol === "https:";
}

/**
 * Set secure cookie with proper flags
 */
export function setSecureCookie(
    name: string,
    value: string,
    maxAge: number = 86400
): void {
    const secure = shouldUseSecureCookies();
    const sameSite = "Strict";

    let cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=${sameSite}`;

    if (secure) {
        cookie += "; Secure";
    }

    document.cookie = cookie;
}

/**
 * CSRF Token Management
 */
class CSRFTokenManager {
    private token: string | null = null;
    private readonly tokenKey = "csrf_token";

    /**
     * Get or generate CSRF token
     */
    getToken(): string {
        if (!this.token) {
            // Try to get from sessionStorage
            this.token = sessionStorage.getItem(this.tokenKey);

            if (!this.token) {
                // Generate new token
                this.token = generateSecureToken();
                sessionStorage.setItem(this.tokenKey, this.token);
            }
        }

        return this.token;
    }

    /**
     * Validate CSRF token
     */
    validateToken(token: string): boolean {
        return token === this.getToken();
    }

    /**
     * Clear CSRF token
     */
    clearToken(): void {
        this.token = null;
        sessionStorage.removeItem(this.tokenKey);
    }

    /**
     * Rotate CSRF token
     */
    rotateToken(): string {
        this.clearToken();
        return this.getToken();
    }
}

export const csrfTokenManager = new CSRFTokenManager();

/**
 * Content Security Policy helpers
 */
import { API_CONFIG } from "@/config/api";

export const CSP_DIRECTIVES = {
    "default-src": ["'self'"],
    // unsafe-inline required for Next.js hydration; unsafe-eval removed for security
    "script-src": ["'self'", "'unsafe-inline'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "https:", API_CONFIG.BACKEND_ORIGIN],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", API_CONFIG.BACKEND_ORIGIN],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
};

/**
 * Generate CSP header value
 */
export function generateCSPHeader(): string {
    return Object.entries(CSP_DIRECTIVES)
        .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
        .join("; ");
}
