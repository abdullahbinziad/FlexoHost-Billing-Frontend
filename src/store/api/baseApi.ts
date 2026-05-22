import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

import { getAccessToken } from "@/utils/tokenManager";
import { getCsrfToken, fetchCsrfToken, clearCsrfToken } from "@/lib/csrfToken";
import { API_CONFIG } from "@/config/api";
import { clearActingAs } from "@/store/slices/activeClientSlice";
import { clearActingAsStorage } from "@/store/slices/activeClientPersistence";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.BASE_URL,
  credentials: "include",
  prepareHeaders: async (headers, { getState }) => {
    const token = (getState() as RootState).auth?.token || getAccessToken();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    const actingAsClientId = (getState() as RootState).activeClient?.actingAsClientId;
    if (actingAsClientId) {
      headers.set("X-Acting-As", actingAsClientId);
    }
    const csrfToken = await getCsrfToken();
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return headers;
  },
});

/** Request URL/path from baseQuery args (string or { url, ... }). */
function getRequestPath(args: unknown): string {
  if (typeof args === "string") return args;
  if (args && typeof args === "object" && "url" in args && typeof (args as { url: string }).url === "string") {
    return (args as { url: string }).url;
  }
  return "";
}

/**
 * On 403: handle CSRF retry and acting-as clear.
 * - CSRF 403: refetch token, retry once.
 * - Acting-as 403: clear state only when failed request was "get acting-as profile".
 */
async function baseQueryWith403Clear(
  args: Parameters<typeof rawBaseQuery>[0],
  api: Parameters<Parameters<typeof createApi>[0]["baseQuery"]>[1],
  extraOptions: Parameters<typeof rawBaseQuery>[2]
) {
  let result = await rawBaseQuery(args, api, extraOptions);
  const err = result.error as { status?: number; data?: { message?: string } } | undefined;
  if (err?.status !== 403) return result;

  const isCsrfError =
    typeof err?.data?.message === "string" &&
    err.data.message.toLowerCase().includes("csrf");

  if (isCsrfError && !(extraOptions as { _csrfRetried?: boolean })?._csrfRetried) {
    clearCsrfToken();
    await fetchCsrfToken();
    const retryOptions = { ...extraOptions, _csrfRetried: true } as Parameters<
      typeof rawBaseQuery
    >[2];
    return rawBaseQuery(args, api, retryOptions);
  }

  const state = (api as { getState: () => RootState }).getState();
  if (!state?.activeClient?.actingAsClientId) return result;

  const path = getRequestPath(args);
  const isActingAsProfileRequest = path.includes("/clients/acting-as/");
  if (!isActingAsProfileRequest) return result;

  (api as { dispatch: (a: unknown) => void }).dispatch(clearActingAs());
  clearActingAsStorage();
  return result;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWith403Clear,
  tagTypes: [
    "User",
    "Product",
    "Order",
    "Invoice",
    "Service",
    "Ticket",
    "Domain",
    "Checkout",
    "Server",
    "ServerGroup",
    "TLD",
    "Client",
    "Promotion",
    "Affiliate",
    "Transaction",
    "Notification",
    "Ticket",
    "ActivityLog",
    "AccessGrant",
    "Automation",
    "Settings",
    "Role",
    "BillableItem",
  ],
  endpoints: () => ({}),
});
