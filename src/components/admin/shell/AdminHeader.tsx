"use client";

import { User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { DarkModeToggle } from "@/components/shared/DarkModeToggle";
import { NotificationsDropdown } from "@/components/shared/NotificationsDropdown";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/useSidebar";

interface AdminHeaderProps {
    onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const { user } = useAuth();
    const { isCollapsed, isMounted } = useSidebar();

    // Calculate left position based on collapsed state
    const headerLeft = isMounted
        ? (isCollapsed ? "lg:left-16" : "lg:left-64")
        : "lg:left-64";

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-30",
            "lg:transition-[left] lg:duration-300 lg:ease-in-out",
            headerLeft
        )}>
            <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuClick}
                    className="lg:hidden"
                    aria-label="Toggle menu"
                >
                    <Menu className="w-6 h-6" />
                </Button>

                {/* Dashboard Title - Desktop */}
                <div className="hidden lg:block flex-1 min-w-0">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Dashboard
                    </h1>
                </div>

                <div className="flex-1 lg:hidden" aria-hidden="true" />

                {/* Right Side Actions */}
                <div className="flex items-center gap-2 lg:gap-4">
                    {/* Dark Mode Toggle */}
                    <DarkModeToggle />

                    {/* Notifications */}
                    <NotificationsDropdown />

                    {/* User Menu */}
                    <div className="flex items-center gap-2 lg:gap-3">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {user?.name || "Administrator"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {user?.role || "Admin"}
                            </p>
                        </div>
                        <Button
                            variant="default"
                            size="icon"
                            className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-black"
                        >
                            <User className="w-4 h-4 lg:w-5 lg:h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
