/**
 * Application Constants
 */

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  CLIENT: {
    DASHBOARD: "/",
    SERVICES: "/services",
    DOMAINS: {
      BASE: "/domains",
      PORTFOLIO: "/domains/portfolio",
      REGISTER: "/domains/register",
      TRANSFERS: "/domains/transfers",
    },
    INVOICES: "/invoices",
    TICKETS: "/tickets",
  },
  ADMIN: {
    DASHBOARD: "/admin",
    USERS: "/admin/users",
    PRODUCTS: "/admin/products",
    ORDERS: "/admin/orders",
  },
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },
  CLIENT: {
    SERVICES: "/services",
    INVOICES: "/invoices",
    TICKETS: "/tickets",
  },
  ADMIN: {
    USERS: "/admin/users",
    PRODUCTS: "/admin/products",
    ORDERS: "/admin/orders",
  },
} as const;
