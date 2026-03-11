import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

import { getAccessToken } from "@/utils/tokenManager";
import { API_CONFIG } from "@/config/api";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from state or cookie
      const token = (getState() as RootState).auth?.token || getAccessToken();

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      // NOTE: For FormData requests (file uploads), fetchBaseQuery
      // will automatically set the correct Content-Type. We only
      // force JSON when it's not already set.
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      return headers;
    },
  }),
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
    "Transaction",
    "Notification",
    "Ticket",
  ],
  endpoints: () => ({}),
});
