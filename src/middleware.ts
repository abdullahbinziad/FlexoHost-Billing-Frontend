import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Middleware for route protection
 * Protects client routes (root and nested routes) from unauthorized access
 * Production-ready with JWT verification
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/checkout",
  ];

  // Define admin routes (may have separate authentication)
  const adminRoutes = ["/admin"];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Check if the current path is an admin route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // If it's a public route or admin route, allow access
  if (isPublicRoute || isAdminRoute) {
    return NextResponse.next();
  }

  // For all other routes (client routes at root level), check authentication
  // Check for authentication token in cookies
  const token = request.cookies.get("auth_token")?.value;

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
      process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
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

    // Token is valid, allow access
    // Add user info to request headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.sub || '');
    response.headers.set('x-user-role', (payload.role as string) || '');
    return response;
  } catch (error) {
    console.error("JWT verification failed:", error);

    // Token is invalid, redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("error", "invalid_token");
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - img (public images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|img).*)",
  ],
};
