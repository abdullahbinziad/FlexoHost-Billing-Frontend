"use client";

import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { loginRateLimiter, isValidEmail } from "@/lib/security";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";
import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, completeSocialLogin } = useAuth();
  // Only disable when user is actively submitting - not during initial auth check
  // (auth check can hang if backend is unreachable, leaving form stuck disabled)
  const { theme } = useTheme();
  const searchParams = useSearchParams();

  // Get message and redirect from URL
  const message = searchParams.get('message');
  const redirect = searchParams.get('redirect');

  // Get message text (including OAuth error from query)
  const errorQuery = searchParams.get("error");
  const getInfoMessage = () => {
    if (message === "login_required") return "Please log in to continue";
    if (message === "access_denied") return "Access denied. You need admin credentials to access this area.";
    if (errorQuery === "session_expired") return "Your session has expired. Please sign in again.";
    if (errorQuery === "invalid_token") return "Your session is invalid. Please sign in again.";
    if (errorQuery === "google_not_configured") return "Google sign-in is not configured.";
    if (errorQuery === "missing_code" || errorQuery === "token_exchange_failed" || errorQuery === "no_access_token" || errorQuery === "userinfo_failed") return "Google sign-in failed. Please try again.";
    return "";
  };

  const infoMessage = getInfoMessage();
  const showOAuthError = Boolean(errorQuery && !["session_expired", "invalid_token"].includes(errorQuery));

  // Handle return from Google OAuth: /login#accessToken=...&refreshToken=...&redirect=...
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken") || undefined;
    const redirectPath = params.get("redirect") || undefined;
    if (accessToken) {
      setIsSubmitting(true);
      completeSocialLogin(accessToken, redirectPath, refreshToken).catch(() => {
        setError("Sign-in failed. Please try again.");
      }).finally(() => setIsSubmitting(false));
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, [completeSocialLogin]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email format
    if (!email || !isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    // Check rate limiting
    if (loginRateLimiter.isRateLimited(email)) {
      const timeUntilReset = loginRateLimiter.getTimeUntilReset(email);
      const minutesLeft = Math.ceil(timeUntilReset / 60000);
      setError(`Too many login attempts. Please try again in ${minutesLeft} minute(s).`);
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password, redirect || undefined);
      // Clear rate limit on successful login
      loginRateLimiter.clearAttempts(email);
      // Redirect is handled by AuthContext
    } catch (err: any) {
      // Record failed attempt
      loginRateLimiter.recordAttempt(email);

      // Extract error message from the error object
      const errorMessage = err?.message || err?.toString() || "Login failed. Please check your credentials.";

      const remaining = loginRateLimiter.getRemainingAttempts(email);
      if (remaining > 0) {
        setError(`${errorMessage} (${remaining} attempt(s) remaining)`);
      } else {
        const timeUntilReset = loginRateLimiter.getTimeUntilReset(email);
        const minutesLeft = Math.ceil(timeUntilReset / 60000);
        setError(`Too many failed attempts. Account locked for ${minutesLeft} minute(s).`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src={
              theme === "dark"
                ? "/img/company/FlexoHostHorizontalforDark.webp"
                : "/img/company/FlexoHostHorizontalforLight.webp"
            }
            alt="FlexoHost Logo"
            width={200}
            height={50}
            className="h-12 w-auto object-contain mx-auto"
            priority
          />
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sign in to access your account
          </p>

          {/* Info / Error Message from URL */}
          {infoMessage && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2 ${showOAuthError ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400" : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"}`}>
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="you@example.com"
                disabled={isSubmitting}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pr-10"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Sign in with Google */}
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-gray-300 dark:border-gray-600"
              disabled={isSubmitting}
              onClick={() => {
                const redirect = searchParams.get("redirect");
                const state = redirect ? encodeURIComponent(redirect) : "";
                const url = state ? `${API_ENDPOINTS.AUTH.GOOGLE}?state=${state}` : API_ENDPOINTS.AUTH.GOOGLE;
                window.location.href = url;
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </Button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
