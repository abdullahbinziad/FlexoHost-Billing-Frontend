/**
 * CSRF token management for double-submit cookie pattern.
 * Fetches token from backend and caches in memory for mutation requests.
 */
import { API_CONFIG } from "@/config/api";

let cachedToken: string | null = null;

const CSRF_ENDPOINT = "/csrf-token";

/**
 * Fetch a fresh CSRF token from the backend.
 * Sets cookie on backend; we store the token to send in X-CSRF-Token header.
 */
export async function fetchCsrfToken(): Promise<string | null> {
  try {
    const base = (API_CONFIG.BASE_URL || "").replace(/\/$/, "");
    const path = `${base}${CSRF_ENDPOINT}`.replace(/^\/+/, "/");
    const url = path.startsWith("http")
      ? path
      : typeof window !== "undefined"
        ? `${window.location.origin}${path}`
        : path;
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const token = json?.data?.token ?? json?.token ?? null;
    if (token && typeof token === "string") {
      cachedToken = token;
      return token;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get the current CSRF token, fetching if needed.
 */
export async function getCsrfToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  return fetchCsrfToken();
}

/**
 * Get the cached token synchronously (may be null if not yet fetched).
 */
export function getCachedCsrfToken(): string | null {
  return cachedToken;
}

/**
 * Clear the cached token (e.g. on logout).
 */
export function clearCsrfToken(): void {
  cachedToken = null;
}
