"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CurrencySwitcher } from "@/components/shared/CurrencySwitcher";
import { DarkModeToggle } from "@/components/shared/DarkModeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { shouldShowCurrencySwitcher } from "@/lib/currencyVisibility";

export function PublicLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    // If still loading auth state, show a minimal loading or nothing
    if (isLoading || !mounted) {
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>;
    }

    // If authenticated, just render children (which will be wrapped by ClientLayout in the parent if configured that way, 
    // BUT since we are replacing the wrapper logic, we need to be careful).
    // Actually, the user wants:
    // If Logged In -> Show Sidebar/Client Layout
    // If Logged Out -> Show Header/Footer Layout

    // However, this component is intended to wrap the public version.
    // If we render null here, the parent might need to handle it.

    // Better approach: This component handles the "Public" look.
    // The parent `layout.tsx` or `page.tsx` needs to decide which layout to use.

    // Determine effective theme for logo
    const logoSrc = theme === "dark"
        ? "/img/company/FlexoHostHorizontalforDark.webp"
        : "/img/company/FlexoHostHorizontalforLight.webp";

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Public Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 print:hidden">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative h-10 w-40">
                            <Image
                                src={logoSrc}
                                alt="FlexoHost Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    <div className="flex items-center gap-4">
                        {/* Currency Switcher (only on purchase/pricing pages) */}
                        {shouldShowCurrencySwitcher(pathname) && <CurrencySwitcher />}

                        {/* Dark Mode Toggle */}
                        <DarkModeToggle />

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

                        <Link href={`/auth/login?redirect=${encodeURIComponent(pathname || '/')}`}>
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8 print:p-0 print:max-w-none">
                {children}
            </main>

            {/* Simple Footer */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 print:hidden">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} FlexoHost. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
