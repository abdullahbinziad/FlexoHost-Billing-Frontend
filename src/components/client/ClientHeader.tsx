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

/** Unified touch targets and shell for icon-only header actions (mobile-first). */
const CLIENT_HEADER_ICON_TRIGGER =
  "h-10 w-10 shrink-0 rounded-full border border-muted-foreground/20 bg-muted/40 text-foreground hover:bg-muted/60";
const CLIENT_HEADER_ICON_GLYPH = "size-4";

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
  const [isSupportPinOpen, setIsSupportPinOpen] = useState(false);
  const supportPinMenuRef = useRef<HTMLDivElement>(null);

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

  // Close user / Support PIN menus when clicking outside (PIN sheet lives inside ref; backdrop closes via its own handler)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const t = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(t)) {
        setIsUserMenuOpen(false);
      }
      if (supportPinMenuRef.current && !supportPinMenuRef.current.contains(t)) {
        setIsSupportPinOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isSupportPinOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsSupportPinOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSupportPinOpen]);

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

  const regenerateSupportPin = async () => {
    try {
      await regeneratePin().unwrap();
      await refetchSupportPin();
      toast.success("Support PIN regenerated.");
    } catch (e) {
      devLog(e);
      toast.error("Failed to regenerate Support PIN.");
    }
  };

  const supportPinValue = (
    <span className="tabular-nums tracking-[0.15em] text-foreground">
      {isLoadingPin ? "••••••" : supportPinData?.supportPin ?? "------"}
    </span>
  );

  const toolbarRight = (
    <>
      {user && (
        <>
          {/* Desktop / tablet: inline pill */}
          <div className="hidden sm:flex items-center gap-2 rounded-full border px-3 py-1 text-xs bg-muted/40 border-muted-foreground/20 text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-medium text-foreground">Support PIN:</span>
            {supportPinValue}
            <button
              type="button"
              className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted disabled:opacity-50"
              onClick={regenerateSupportPin}
              disabled={isRegeneratingPin}
              title="Generate new Support PIN"
            >
              <RefreshCw className={cn("w-3 h-3", isRegeneratingPin && "animate-spin")} />
            </button>
          </div>

          {/* Mobile: icon + flyout — keeps header single-row; PIN one tap away */}
          <div className="relative sm:hidden" ref={supportPinMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsUserMenuOpen(false);
                setIsSupportPinOpen((o) => !o);
              }}
              className={cn(
                "inline-flex items-center justify-center text-primary",
                CLIENT_HEADER_ICON_TRIGGER,
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              aria-label="View Support PIN"
              aria-expanded={isSupportPinOpen}
            >
              <Shield className={cn(CLIENT_HEADER_ICON_GLYPH, "text-primary")} />
            </button>
            {isSupportPinOpen ? (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] sm:hidden"
                  aria-hidden
                  onClick={() => setIsSupportPinOpen(false)}
                />
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Support PIN"
                  className={cn(
                    "fixed left-4 right-4 z-50 max-h-[min(24rem,85dvh)] overflow-y-auto sm:hidden",
                    isManaging ? "top-[calc(10.25rem+0.5rem)]" : "top-[calc(4rem+0.5rem)]",
                    "rounded-2xl border border-border bg-card px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-2xl",
                    "animate-in slide-in-from-top duration-300"
                  )}
                >
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    Support PIN
                  </p>
                  <p className="mt-3 text-center text-2xl font-medium tabular-nums tracking-[0.25em] text-foreground">
                    {isLoadingPin ? "••••••" : supportPinData?.supportPin ?? "------"}
                  </p>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Share this code only with support when asked.
                  </p>
                  <button
                    type="button"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 py-3 text-sm font-medium text-foreground hover:bg-muted/70 disabled:opacity-50"
                    onClick={regenerateSupportPin}
                    disabled={isRegeneratingPin}
                  >
                    <RefreshCw className={cn("h-4 w-4", isRegeneratingPin && "animate-spin")} />
                    Generate new PIN
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </>
      )}

      {shouldShowCurrencySwitcher(pathname) && <CurrencySwitcher />}

      <DarkModeToggle
        className={CLIENT_HEADER_ICON_TRIGGER}
        iconClassName={CLIENT_HEADER_ICON_GLYPH}
      />

      <NotificationsDropdown
        triggerClassName={CLIENT_HEADER_ICON_TRIGGER}
        iconClassName={CLIENT_HEADER_ICON_GLYPH}
      />

      <div className="relative" ref={userMenuRef}>
        <button
          type="button"
          aria-label="Open account menu"
          onClick={() => {
            setIsSupportPinOpen(false);
            setIsUserMenuOpen(!isUserMenuOpen);
          }}
          className={cn(
            "flex items-center gap-2 lg:gap-3 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "h-10 w-10 shrink-0 justify-center p-0 md:h-auto md:w-auto md:p-1 lg:p-1.5",
            CLIENT_HEADER_ICON_TRIGGER,
            "md:border-transparent md:bg-transparent md:hover:bg-gray-100 md:dark:hover:bg-gray-800"
          )}
        >
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {`Hi ${displayName}!`}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user?.role}
            </p>
          </div>
          <User className="md:hidden shrink-0 size-4 text-primary" aria-hidden />
          <div className="hidden md:flex w-8 h-8 lg:w-9 lg:h-9 bg-primary/10 rounded-full items-center justify-center text-primary">
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

        <div className="flex min-w-0 shrink-0 items-center justify-end gap-2 lg:gap-3">
          {toolbarRight}
        </div>
      </div>
    </header>
  );
}
