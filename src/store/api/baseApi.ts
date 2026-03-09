import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

import { getAccessToken } from "@/utils/tokenManager";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      // Get token from state or cookie
      const token = (getState() as RootState).auth?.token || getAccessToken();

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      headers.set("Content-Type", "application/json");
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
  ],
  endpoints: () => ({}),
});
