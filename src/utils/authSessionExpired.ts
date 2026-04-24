/**
 * Shared cleanup + redirect when the session is invalid (e.g. expired JWT, 401 from API).
 * Used by RTK Query baseQuery and apiClient so all API paths behave consistently.
 */

import type { AppDispatch } from "@/store";
import { clearCredentials } from "@/store/slices/authSlice";
import { clearActingAs } from "@/store/slices/activeClientSlice";
import { clearActingAsStorage } from "@/store/slices/activeClientPersistence";
import { clearAuthTokens } from "@/utils/tokenManager";
import { clearCsrfToken } from "@/lib/csrfToken";

/** Paths where 401 is expected / must not trigger a global logout redirect */
const UNAUTH_PUBLIC_PATH_PREFIXES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh-token",
  "/auth/logout",
] as const;

let sessionExpiryRedirectScheduled = false;

/** Routes where 401 is expected for guests (e.g. optional /auth/me check), not session expiry. */
const GUEST_AUTH_FLOW_PATH_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/checkout",
] as const;

/** True on login/register/etc. where optional auth checks return 401 for guests. */
export function isGuestAuthFlowRoute(): boolean {
  if (typeof window === "undefined") return false;
  const p = window.location.pathname;
  return GUEST_AUTH_FLOW_PATH_PREFIXES.some((prefix) => p.startsWith(prefix));
}

export function isAuthPublicUnauthorizedPath(apiPath: string): boolean {
  const p = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;
  return UNAUTH_PUBLIC_PATH_PREFIXES.some((prefix) => p.startsWith(prefix));
}

export function performAuthSessionCleanup(dispatch: AppDispatch): void {
  clearAuthTokens();
  clearCsrfToken();
  dispatch(clearCredentials());
  dispatch(clearActingAs());
  clearActingAsStorage();
}

/**
 * Full reload to login so middleware and React state stay in sync after session loss.
 */
export function redirectToLoginAfterSessionExpired(): void {
  if (typeof window === "undefined" || sessionExpiryRedirectScheduled) return;
  sessionExpiryRedirectScheduled = true;
  const redirect = `${window.location.pathname}${window.location.search}`;
  const loginUrl = `/login?error=session_expired&redirect=${encodeURIComponent(redirect)}`;
  window.location.assign(loginUrl);
}
