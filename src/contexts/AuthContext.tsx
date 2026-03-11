"use client";

/**
 * Authentication Context
 * Provides authentication state and actions throughout the application
 * Production-ready with full backend integration
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authenticationService } from "@/services/authentication.service";
import { clientService } from "@/services/client.service";
import type {
    User,
    RegisterUserData,
    ClientRegistrationData,
    ChangePasswordData,
    ResetPasswordData,
    AuthContextType,
} from "@/types/auth";
import {
    setAccessToken,
    setRefreshToken,
    getAccessToken,
    getRefreshToken,
    clearAuthTokens,
    isTokenExpired,
} from "@/utils/tokenManager";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    /**
     * Check authentication status on mount
     */
    useEffect(() => {
        checkAuth();
    }, []);

    /**
     * Check if user is authenticated
     */
    const checkAuth = useCallback(async () => {
        try {
            const token = getAccessToken();

            if (!token) {
                setIsLoading(false);
                return;
            }

            // Check if token is expired
            if (isTokenExpired(token)) {
                // Try to refresh token
                await refreshToken();
                return;
            }

            // Verify token with backend
            const response = await authenticationService.verifyToken();

            if (response.success && response.data?.user) {
                setUser(response.data.user);
            } else {
                // Token is invalid, clear it
                clearAuthTokens();
                setUser(null);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            clearAuthTokens();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Get role-based default dashboard
     * Admin/staff → /admin, client/others → /
     */
    const getRoleBasedDefault = (role: string): string => {
        if (['superadmin', 'admin', 'staff'].includes(role)) {
            return '/admin';
        }
        return '/';
    };

    /**
     * Redirect to complete-profile if user (client/user role) has not completed profile.
     */
    const getRedirectAfterLogin = (user: { role: string; profileCompleted?: boolean }, redirectPath: string | null): string => {
        const needsProfile = ['client', 'user'].includes(user.role) && user.profileCompleted === false;
        if (needsProfile) return '/complete-profile';
        return getSmartRedirect(redirectPath, user.role);
    };

    /**
     * Validate and get smart redirect path based on user role
     */
    const getSmartRedirect = (redirectPath: string | null, userRole: string): string => {
        // If no redirect parameter, redirect based on role
        if (!redirectPath) {
            return getRoleBasedDefault(userRole);
        }

        const decodedPath = decodeURIComponent(redirectPath);

        // Prevent auth page loops
        if (decodedPath.startsWith('/auth') ||
            decodedPath.startsWith('/login') ||
            decodedPath.startsWith('/register')) {
            return getRoleBasedDefault(userRole);
        }

        // Validate admin routes
        if (decodedPath.startsWith('/admin')) {
            if (['superadmin', 'admin', 'staff'].includes(userRole)) {
                return decodedPath;
            }
            return '/client';
        }

        // Validate client routes
        if (decodedPath.startsWith('/client')) {
            if (userRole === 'client') {
                return decodedPath;
            }
            if (['superadmin', 'admin', 'staff'].includes(userRole)) {
                return decodedPath;
            }
        }

        return decodedPath;
    };

    /**
     * Login user
     */
    const login = async (email: string, password: string, redirectUrl?: string): Promise<void> => {
        try {
            setIsLoading(true);

            // Get redirect parameter: prefer explicitly passed url, then URL query param
            let redirectPath: string | null = redirectUrl || null;
            if (!redirectPath && typeof window !== 'undefined') {
                const urlParams = new URLSearchParams(window.location.search);
                redirectPath = urlParams.get("redirect");
            }

            // Real API call
            const response = await authenticationService.login({ email, password });

            if (response.success && response.data) {
                const { user, accessToken } = response.data;

                // Set tokens
                setAccessToken(accessToken);

                // Set user
                setUser(user);

                const finalRedirect = getRedirectAfterLogin(user, redirectPath);

                if (redirectUrl !== "NO_REDIRECT") {
                    router.push(finalRedirect);
                }
            } else {
                throw new Error(response.message || "Login failed");
            }
        } catch (error: any) {
            console.error("Login failed:", error);
            throw new Error(error.message || "Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Complete login after Google (or other OAuth) redirect. Call when landing on /login#accessToken=...&redirect=...
     */
    const completeSocialLogin = async (accessToken: string, redirectPath?: string): Promise<void> => {
        try {
            setIsLoading(true);
            setAccessToken(accessToken);
            const response = await authenticationService.verifyToken();
            if (response.success && response.data?.user) {
                setUser(response.data.user);
                const finalRedirect = getRedirectAfterLogin(response.data.user, redirectPath || null);
                router.push(finalRedirect);
            } else {
                clearAuthTokens();
                setUser(null);
                throw new Error("Invalid token");
            }
        } catch (error: any) {
            console.error("Social login complete failed:", error);
            clearAuthTokens();
            setUser(null);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Register new user (simple registration)
     */
    const register = async (data: RegisterUserData): Promise<void> => {
        try {
            setIsLoading(true);

            // Real API call
            const response = await authenticationService.register(data);

            if (response.success && response.data) {
                const { user, accessToken } = response.data;

                // Set tokens
                setAccessToken(accessToken);

                // Set user
                setUser(user);

                // Redirect to dashboard
                router.push("/");
            } else {
                throw new Error(response.message || "Registration failed");
            }
        } catch (error: any) {
            console.error("Registration failed:", error);
            throw new Error(error.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Register new client (with complete profile)
     */
    const registerClient = async (data: ClientRegistrationData): Promise<void> => {
        try {
            setIsLoading(true);

            // Real API call
            const response = await clientService.registerClient(data);

            if (response.success && response.data) {
                const { user, accessToken } = response.data;

                // Set tokens
                setAccessToken(accessToken);

                // Set user
                setUser(user);

                // Redirect to dashboard
                router.push("/");
            } else {
                throw new Error(response.message || "Registration failed");
            }
        } catch (error: any) {
            console.error("Client registration failed:", error);
            throw new Error(error.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Logout user
     */
    const logout = async (): Promise<void> => {
        try {
            // Call logout API to invalidate token on server
            await authenticationService.logout();
        } catch (error) {
            console.error("Logout API call failed:", error);
        } finally {
            // Clear tokens and state regardless of API call result
            clearAuthTokens();
            setUser(null);

            // Redirect to login
            router.push("/login");
        }
    };

    /**
     * Change password
     */
    const changePassword = async (data: ChangePasswordData): Promise<void> => {
        try {
            setIsLoading(true);

            // Real API call
            const response = await authenticationService.changePassword(data);

            if (!response.success) {
                throw new Error(response.message || "Password change failed");
            }

            // Logout after password change for security
            await logout();
        } catch (error: any) {
            console.error("Password change failed:", error);
            throw new Error(error.message || "Failed to change password.");
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Forgot password
     */
    const forgotPassword = async (email: string): Promise<void> => {
        try {
            setIsLoading(true);

            // Real API call
            const response = await authenticationService.forgotPassword({ email });

            if (!response.success) {
                throw new Error(response.message || "Failed to send reset email");
            }
        } catch (error: any) {
            console.error("Forgot password failed:", error);
            throw new Error(error.message || "Failed to send reset email.");
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Reset password
     */
    const resetPassword = async (data: ResetPasswordData): Promise<void> => {
        try {
            setIsLoading(true);

            // Real API call
            const response = await authenticationService.resetPassword(data);

            if (!response.success) {
                throw new Error(response.message || "Password reset failed");
            }

            // Redirect to login after successful reset
            router.push("/login?message=password_reset_success");
        } catch (error: any) {
            console.error("Reset password failed:", error);
            throw new Error(error.message || "Failed to reset password.");
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Refresh authentication token
     */
    const refreshToken = async (): Promise<void> => {
        try {
            const refreshTokenValue = getRefreshToken();

            if (!refreshTokenValue) {
                throw new Error("No refresh token available");
            }

            // Real API call
            const response = await authenticationService.refreshToken(refreshTokenValue);

            if (response.success && response.data) {
                setAccessToken(response.data.accessToken);

                if (response.data.refreshToken) {
                    setRefreshToken(response.data.refreshToken);
                }

                // Reload user data
                await checkAuth();
            } else {
                throw new Error("Token refresh failed");
            }
        } catch (error) {
            console.error("Token refresh failed:", error);
            // If refresh fails, logout user
            clearAuthTokens();
            setUser(null);
            router.push("/login?error=session_expired");
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        completeSocialLogin,
        register,
        registerClient,
        logout,
        changePassword,
        forgotPassword,
        resetPassword,
        refreshToken,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use authentication context
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}
