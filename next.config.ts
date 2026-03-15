import type { NextConfig } from "next";

// Actual backend URL for rewrites (must be different from frontend)
const BACKEND_ORIGIN = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001").origin;
  } catch {
    return "http://localhost:5001";
  }
})();

const isDev = process.env.NODE_ENV === "development";
const CSP = [
  "default-src 'self'",
  // Next.js React Refresh (HMR) requires unsafe-eval in development
  isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: https: ${BACKEND_ORIGIN}`,
  "font-src 'self' data:",
  `connect-src 'self' ${BACKEND_ORIGIN}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  turbopack: {},
  // Disable webpack cache in dev to avoid ENOENT/rename errors (e.g. paths with spaces)
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${BACKEND_ORIGIN}/uploads/:path*`,
      },
      // API /api/v1/* is proxied via app/api/v1/[...path]/route.ts to explicitly
      // forward cookies (Next.js rewrites may not forward Cookie header)
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: CSP,
          },
          {
            key: "Access-Control-Allow-Origin",
            value: BACKEND_ORIGIN,
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization, X-CSRF-Token, X-Acting-As",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
