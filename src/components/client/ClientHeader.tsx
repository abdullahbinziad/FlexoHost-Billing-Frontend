"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, User, Menu, LogOut, Settings, UserCircle, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { CurrencySwitcher } from "@/components/shared/CurrencySwitcher";
import { DarkModeToggle } from "@/components/shared/DarkModeToggle";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/useSidebar";
import Link from "next/link";
import { shouldShowCurrencySwitcher } from "@/lib/currencyVisibility";
import {
  useGetMySupportPinQuery,
  useRegenerateMySupportPinMutation,
} from "@/store/api/clientApi";
import { toast } from "sonner";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/store/api/notificationApi";

interface ClientHeaderProps {
  onMenuClick: () => void;
}

export function ClientHeader({ onMenuClick }: ClientHeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const { isCollapsed, isMounted } = useSidebar();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { data: notificationsData } = useGetNotificationsQuery({ page: 1, limit: 10 });
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [markAllNotificationsRead] = useMarkAllNotificationsReadMutation();

  // Support PIN — fetch once per mount; refetch only when user clicks Regenerate
  const {
    data: supportPinData,
    isLoading: isLoadingPin,
    refetch: refetchSupportPin,
  } = useGetMySupportPinQuery(undefined, {
    skip: !user,
    refetchOnFocus: false,
    refetchOnMountOrArgChange: false,
    pollingInterval: 0,
  });
  const [regeneratePin, { isLoading: isRegeneratingPin }] = useRegenerateMySupportPinMutation();

  const unreadCount = notificationsData?.unreadCount ?? 0;

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Calculate left position based on collapsed state
  // Mobile: left-0, Desktop: left-16 (collapsed) or left-64 (expanded)
  // Default to expanded (left-64) until mounted to prevent layout shift
  const headerLeft = isMounted
    ? (isCollapsed ? "lg:left-16" : "lg:left-64")
    : "lg:left-64";

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-30 print:hidden",
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

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
        >
          <Search className="w-5 h-5" />
        </Button>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Support PIN badge (client only) */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 rounded-full border px-3 py-1 text-xs bg-muted/40 border-muted-foreground/20 text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium text-foreground">Support PIN:</span>
              <span className="tabular-nums tracking-[0.15em] text-foreground">
                {isLoadingPin ? "••••••" : supportPinData?.supportPin ?? "------"}
              </span>
              <button
                type="button"
                className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted disabled:opacity-50"
                onClick={async () => {
                  try {
                    await regeneratePin().unwrap();
                    await refetchSupportPin();
                    toast.success("Support PIN regenerated.");
                  } catch (e) {
                    console.error(e);
                    toast.error("Failed to regenerate Support PIN.");
                  }
                }}
                disabled={isRegeneratingPin}
                title="Generate new Support PIN"
              >
                <RefreshCw className={cn("w-3 h-3", isRegeneratingPin && "animate-spin")} />
              </button>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <DarkModeToggle />

          {/* Currency Switcher (only on purchase/pricing pages) */}
          {shouldShowCurrencySwitcher(pathname) && <CurrencySwitcher />}

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsNotificationsOpen((open) => !open)}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-40">
                <div className="flex items-center justify-between px-3 pb-2 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      className="text-[11px] text-primary hover:underline"
                      onClick={() => markAllNotificationsRead()}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notificationsData?.results.length ? (
                    notificationsData.results.map((n) => (
                      <button
                        key={n._id}
                        className={cn(
                          "w-full text-left px-3 py-2 text-xs border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60",
                          !n.read && "bg-blue-50/70 dark:bg-blue-900/20"
                        )}
                        onClick={async () => {
                          setIsNotificationsOpen(false);
                          if (!n.read) {
                            await markNotificationRead(n._id);
                          }
                          if (n.linkPath) {
                            window.location.href = n.linkPath;
                          }
                        }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {n.title}
                            </div>
                            <div className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2">
                              {n.message}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 lg:gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1 lg:p-1.5 transition-colors focus:outline-none"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role}
                </p>
              </div>
              <div className="w-8 h-8 lg:w-9 lg:h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <User className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 md:hidden">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role}
                  </p>
                </div>

                <Link
                  href="/me"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <UserCircle className="w-4 h-4" />
                  <span>Profile</span>
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>

                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
