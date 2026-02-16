"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { USER_ROLES } from "@/config/api";

interface AdminRouteGuardProps {
    children: React.ReactNode;
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        // Wait for auth to finish loading
        if (isLoading) return;

        // Don't redirect if already on auth pages (prevent loops)
        if (pathname.startsWith('/auth') || pathname.startsWith('/login') || pathname.startsWith('/register')) {
            return;
        }

        // If not authenticated, redirect to login with current path
        if (!isAuthenticated || !user) {
            router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}&message=login_required`);
            return;
        }

        // Check if user has admin role
        const allowedRoles: string[] = [USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN, USER_ROLES.STAFF];
        const hasAdminAccess = allowedRoles.includes(user.role);

        if (!hasAdminAccess) {
            // Redirect unauthorized users to login with access denied message
            router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}&message=access_denied`);
            return;
        }
    }, [isAuthenticated, user, isLoading, router, pathname]);

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center space-y-4">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <div>
                        <p className="text-lg font-medium text-foreground">Verifying Access</p>
                        <p className="text-sm text-muted-foreground mt-1">Please wait...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Only render children if authenticated and authorized
    if (!isAuthenticated || !user) {
        return null;
    }

    const allowedRoles: string[] = [USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN, USER_ROLES.STAFF];
    const hasAdminAccess = allowedRoles.includes(user.role);

    if (!hasAdminAccess) {
        return null;
    }

    // User is authenticated and authorized
    return <>{children}</>;
}
