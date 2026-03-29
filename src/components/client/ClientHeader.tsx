"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { User, Menu, LogOut, Settings, UserCircle, RefreshCw, Shield, ArrowLeft } from "lucide-react";
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
import { NotificationsDropdown } from "@/components/shared/NotificationsDropdown";
import { devLog } from "@/lib/devLog";

interface ClientHeaderProps {
  onMenuClick: () => void;
  /** When set (shared access / acting-as), shows centered “You are managing … account”. */
  managingAccountLabel?: string;
  /** Clears acting-as and returns to own account (shown when managing). */
  onExitManagingAccount?: () => void;
}

export function ClientHeader({
  onMenuClick,
  managingAccountLabel,
  onExitManagingAccount,
}: ClientHeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const userWithClient = user as (typeof user & {
    firstName?: string;
    lastName?: string;
    client?: { firstName?: string; lastName?: string; companyName?: string };
  }) | null;
  const fullNameFromClient =
    [userWithClient?.client?.firstName, userWithClient?.client?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
  const fullNameFromUser =
    [userWithClient?.firstName, userWithClient?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
  const displayName =
    fullNameFromClient ||
    fullNameFromUser ||
    (user?.name && user.name.trim()) ||
    userWithClient?.client?.companyName?.trim() ||
    "User";

  const { isCollapsed, isMounted } = useSidebar();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
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
      devLog("Logout failed", error);
    }
  };

  // Calculate left position based on collapsed state
  // Mobile: left-0, Desktop: left-16 (collapsed) or left-64 (expanded)
  // Default to expanded (left-64) until mounted to prevent layout shift
  const headerLeft = isMounted
    ? (isCollapsed ? "lg:left-16" : "lg:left-64")
    : "lg:left-64";

  const isManaging = Boolean(managingAccountLabel);

  const toolbarRight = (
    <>
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
                devLog(e);
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

      {shouldShowCurrencySwitcher(pathname) && <CurrencySwitcher />}

      <DarkModeToggle />

      <NotificationsDropdown />

      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center gap-2 lg:gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1 lg:p-1.5 transition-colors focus:outline-none"
        >
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {`Hi ${displayName}!`}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user?.role}
            </p>
          </div>
          <div className="w-8 h-8 lg:w-9 lg:h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <User className="w-4 h-4 lg:w-5 lg:h-5" />
          </div>
        </button>

        {isUserMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 md:hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {`Hi ${displayName}!`}
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
    </>
  );

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-30 flex flex-col print:hidden",
        "lg:transition-[left] lg:duration-300 lg:ease-in-out",
        headerLeft,
        isManaging ? "h-auto" : "h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      )}
    >
      {isManaging && managingAccountLabel && onExitManagingAccount ? (
        <div
          className={cn(
            "shrink-0 border-b border-amber-300/70 dark:border-amber-800/90",
            "bg-gradient-to-b from-amber-50 to-amber-50/95 dark:from-amber-950/50 dark:to-amber-950/35",
            "px-2 py-2.5 sm:px-4 sm:py-3"
          )}
        >
          <div className="flex flex-col items-center gap-2.5 sm:flex-row sm:items-center sm:gap-3">
            <div className="hidden min-w-0 sm:block sm:flex-1" aria-hidden="true" />
            <p
              className={cn(
                "w-full max-w-xl px-1 text-center text-sm leading-snug text-amber-950 dark:text-amber-50",
                "sm:min-w-0 sm:flex-1 sm:max-w-none sm:px-0 sm:text-[0.9375rem]"
              )}
              title={`You are managing ${managingAccountLabel}'s account`}
            >
              <span className="font-medium">You are managing </span>
              <span className="break-words font-semibold [overflow-wrap:anywhere]">{managingAccountLabel}</span>
              <span className="font-medium">&apos;s account</span>
            </p>
            <div className="flex w-full shrink-0 justify-center sm:w-auto sm:flex-1 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onExitManagingAccount}
                className={cn(
                  "h-9 gap-2 shadow-sm sm:h-8",
                  "border-amber-400/80 bg-white text-amber-950 hover:bg-amber-100/90",
                  "dark:border-amber-600 dark:bg-amber-950/60 dark:text-amber-50 dark:hover:bg-amber-900/70"
                )}
                aria-label="Switch back to my account"
              >
                <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Switch back
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "flex min-h-14 flex-1 items-center justify-between gap-3 px-3 sm:px-4 lg:px-6 sm:min-h-16",
          "border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900",
          !isManaging && "h-full"
        )}
      >
        <div className="flex min-w-0 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden shrink-0"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex min-w-0 shrink-0 items-center justify-end gap-1.5 sm:gap-2 lg:gap-3">
          {toolbarRight}
        </div>
      </div>
    </header>
  );
}
