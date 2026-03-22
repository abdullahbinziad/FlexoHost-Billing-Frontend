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
import { store } from "@/store";
import { setCredentials, clearCredentials } from "@/store/slices/authSlice";
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
import { fetchCsrfToken, clearCsrfToken } from "@/lib/csrfToken";
import { devLog } from "@/lib/devLog";
import { normalizeRole } from "@/types/navigation";
import { USER_ROLES } from "@/config/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Sync user and token to Redux so AdminSidebar and other components get permissions */
function syncUserToRedux(user: User | null, token: string | null) {
    if (!user) {
        store.dispatch(clearCredentials());
        return;
    }
    const resolvedToken = token ?? getAccessToken();
    // When we have a user from a successful API response, always sync to Redux.
    // Token can be null in cookie-only mode (auth via HttpOnly cookie) - session is still valid.
    const rawRole = (user as { role?: string }).role;
    const role = normalizeRole(rawRole) || USER_ROLES.USER;
    const rawRoleData = (user as { roleData?: { permissions?: string[]; hasFullAccess?: boolean; _id?: string; name?: string } }).roleData;
    const authUser = {
        id: user.id ?? (user as { _id?: string })._id ?? "",
        email: user.email,
        role: role as "superadmin" | "admin" | "staff" | "client" | "user",
        roleData: rawRoleData
            ? {
                  ...rawRoleData,
                  permissions: Array.isArray(rawRoleData.permissions) ? rawRoleData.permissions : [],
              }
            : undefined,
    };
    store.dispatch(setCredentials({ token: resolvedToken || 'cookie-auth', user: authUser }));
}

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
        fetchCsrfToken(); // Prefetch CSRF token for cookie-based auth
        checkAuth();
    }, []);

    /**
     * Check if user is authenticated
     */
    const checkAuth = useCallback(async () => {
        try {
            const token = getAccessToken();
            if (token && isTokenExpired(token)) {
                await refreshToken();
                return;
            }

            // Verify with backend (uses cookie via credentials or Authorization header)
            const response = await authenticationService.verifyToken();

            if (response.success && response.data?.user) {
                const u = response.data.user;
                setUser(u);
                syncUserToRedux(u, getAccessToken());
            } else {
                clearAuthTokens();
                setUser(null);
                syncUserToRedux(null, null);
            }
        } catch (error) {
            devLog("Auth check failed:", error);
            clearAuthTokens();
            setUser(null);
            syncUserToRedux(null, null);
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
    const getRedirectAfterLogin = (user: { role?: string; profileCompleted?: boolean } | null | undefined, redirectPath: string | null): string => {
        if (!user) {
            return redirectPath && redirectPath.startsWith("/") ? redirectPath : "/";
        }
        const role = normalizeRole(user.role);
        if (!role) {
            return redirectPath && redirectPath.startsWith("/") ? redirectPath : "/";
        }
        const needsProfile = ['client', 'user'].includes(role) && user.profileCompleted === false;
        if (needsProfile) return '/complete-profile';
        return getSmartRedirect(redirectPath, role);
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

        // Prevent open redirect: only allow relative paths (must start with / but not //)
        if (!decodedPath.startsWith('/') || decodedPath.startsWith('//')) {
            return getRoleBasedDefault(userRole);
        }

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
                const { user, accessToken, refreshToken } = response.data;

                const role = user ? normalizeRole((user as { role?: string }).role) : "";
                if (!user || !role) {
                    throw new Error("Invalid login response: user data missing");
                }

                // Set tokens only when returned (cookie-only auth omits them; cookies are sent via credentials)
                if (accessToken) setAccessToken(accessToken);
                if (refreshToken) setRefreshToken(refreshToken);

                // Set user and sync to Redux (for AdminSidebar permissions)
                setUser(user);
                syncUserToRedux(user, accessToken ?? null);

                const finalRedirect = getRedirectAfterLogin(user, redirectPath);

                if (redirectUrl !== "NO_REDIRECT") {
                    router.push(finalRedirect);
                }
            } else {
                throw new Error(response.message || "Login failed");
            }
        } catch (error: any) {
            devLog("Login failed:", error);
            throw new Error(error.message || "Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Complete login after Google (or other OAuth) redirect. Call when landing on /login#accessToken=...&redirect=...
     */
    const completeSocialLogin = async (accessToken: string, redirectPath?: string, refreshToken?: string): Promise<void> => {
        try {
            setIsLoading(true);
            setAccessToken(accessToken);
            if (refreshToken) setRefreshToken(refreshToken);
            const response = await authenticationService.verifyToken();
            if (response.success && response.data?.user) {
                const u = response.data.user;
                setUser(u);
                syncUserToRedux(u, accessToken);
                const finalRedirect = getRedirectAfterLogin(u, redirectPath || null);
                router.push(finalRedirect);
            } else {
                clearAuthTokens();
                setUser(null);
                syncUserToRedux(null, null);
                throw new Error("Invalid token");
            }
        } catch (error: any) {
            devLog("Social login complete failed:", error);
            clearAuthTokens();
            setUser(null);
            syncUserToRedux(null, null);
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
                const { user, accessToken, refreshToken } = response.data;

                // Set tokens only when returned (cookie-only auth omits them)
                if (accessToken) setAccessToken(accessToken);
                if (refreshToken) setRefreshToken(refreshToken);

                // Set user and sync to Redux
                setUser(user);
                syncUserToRedux(user, accessToken ?? null);

                // Redirect to dashboard
                router.push("/");
            } else {
                throw new Error(response.message || "Registration failed");
            }
        } catch (error: any) {
            devLog("Registration failed:", error);
            throw new Error(error.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Register new client (with complete profile)
     */
    const registerClient = async (data: ClientRegistrationData, redirectUrl?: string | null): Promise<void> => {
        try {
            setIsLoading(true);

            // Real API call
            const response = await clientService.registerClient(data);

            if (response.success && response.data) {
                const { user, accessToken, refreshToken } = response.data;

                // Set tokens only when returned (cookie-only auth omits them)
                if (accessToken) setAccessToken(accessToken);
                if (refreshToken) setRefreshToken(refreshToken);

                // Set user and sync to Redux
                setUser(user);
                syncUserToRedux(user, accessToken ?? null);

                const finalRedirect = getRedirectAfterLogin(user, redirectUrl ?? null);
                router.push(finalRedirect);
            } else {
                throw new Error(response.message || "Registration failed");
            }
        } catch (error: any) {
            devLog("Client registration failed:", error);
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
            devLog("Logout API call failed:", error);
        } finally {
            // Clear tokens and state regardless of API call result
            clearAuthTokens();
            clearCsrfToken();
            setUser(null);
            syncUserToRedux(null, null);

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
            devLog("Password change failed:", error);
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
            devLog("Forgot password failed:", error);
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
            devLog("Reset password failed:", error);
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

            // Cookie-only auth: no token in storage; backend reads from HttpOnly cookie
            const response = await authenticationService.refreshToken(refreshTokenValue ?? undefined);

            if (response.success && response.data) {
                if (response.data.accessToken) setAccessToken(response.data.accessToken);
                if (response.data.refreshToken) setRefreshToken(response.data.refreshToken);

                // Reload user data
                await checkAuth();
            } else {
                throw new Error("Token refresh failed");
            }
        } catch (error) {
            devLog("Token refresh failed:", error);
            // If refresh fails, logout user
            clearAuthTokens();
            setUser(null);
            syncUserToRedux(null, null);
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
