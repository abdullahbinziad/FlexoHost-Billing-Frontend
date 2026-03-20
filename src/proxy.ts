import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { devLog } from "@/lib/devLog";
import { API_CONFIG } from "./config/api";

/**
 * Proxy for route protection
 * Protects client routes (root and nested routes) from unauthorized access
 * Production-ready with JWT verification
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/checkout",
    "/status",
  ];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Admin area prefix
  const isAdminRoute = pathname.startsWith("/admin");

  // Always allow public routes to pass through
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For all protected routes, require authentication via JWT in cookies
  // Backend sets "jwt" cookie; frontend sets "auth_token" when token is in response body
  const token =
    request.cookies.get("auth_token")?.value ||
    request.cookies.get("jwt")?.value;

  // If no token is found, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    // Add the original URL as a redirect parameter
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate JWT token (Production mode only)
  try {
    const secret = new TextEncoder().encode(
      API_CONFIG.JWT_SECRET
    );

    // Verify the JWT token
    const { payload } = await jwtVerify(token, secret);

    // Check if token has expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      // Token expired, redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("error", "session_expired");
      return NextResponse.redirect(loginUrl);
    }

    const userRole = (payload.role as string) || "";
    const adminRoles = ["superadmin", "admin", "staff"];
    const isAdminUser = adminRoles.includes(userRole);

    // Hard rule: clients (non-admin roles) must never access /admin
    if (isAdminRoute && !isAdminUser) {
      const redirectUrl = new URL("/", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Hard rule: admin/staff users should not use the root client area as their dashboard.
    // If an admin user hits the root ("/") or other non-admin, non-public routes,
    // force them into the /admin area.
    const isAuthPage =
      pathname.startsWith("/auth") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register");

    if (isAdminUser && !isAdminRoute && !isPublicRoute && !isAuthPage) {
      const adminUrl = new URL("/admin", request.url);
      return NextResponse.redirect(adminUrl);
    }

    // Token is valid and path is allowed
    // Add user info to request headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.sub || '');
    response.headers.set('x-user-role', (payload.role as string) || '');
    return response;
  } catch (error) {
    const isExpired = (error as { code?: string })?.code === "ERR_JWT_EXPIRED";
    if (!isExpired) {
      devLog("JWT verification failed:", error);
    }

    // Token is invalid or expired, redirect to login and clear the bad cookie
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("error", isExpired ? "session_expired" : "invalid_token");
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
    response.cookies.set("jwt", "", { maxAge: 0, path: "/" });
    response.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
    response.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - uploads (proxied to backend, static files)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - img (public images)
     */
    "/((?!api|uploads|_next/static|_next/image|favicon.ico|img).*)",
  ],
};
