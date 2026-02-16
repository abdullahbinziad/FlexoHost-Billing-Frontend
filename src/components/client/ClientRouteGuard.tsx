"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ClientRouteGuardProps {
    children: React.ReactNode;
}

export function ClientRouteGuard({ children }: ClientRouteGuardProps) {
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

        // Allow public access to checkout
        if (pathname.startsWith('/checkout')) {
            return;
        }

        // If not authenticated, redirect to login with current path
        if (!isAuthenticated || !user) {
            router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}&message=login_required`);
            return;
        }

        // Client routes are accessible by both clients and admins
        // Admins can access client routes for support/management purposes
        // No role restriction needed here
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

    // Only render children if authenticated OR if on a public route
    if (isAuthenticated && user) {
        return <>{children}</>;
    }

    // Allow public access
    if (pathname.startsWith('/checkout')) {
        return <>{children}</>;
    }

    // Otherwise, we are likely redirecting, so return null
    return null;
}
