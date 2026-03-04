"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { loginRateLimiter, isValidEmail } from "@/lib/security";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const { theme } = useTheme();
  const searchParams = useSearchParams();

  // Get message and redirect from URL
  const message = searchParams.get('message');
  const redirect = searchParams.get('redirect');

  // Get message text
  const getInfoMessage = () => {
    if (message === 'login_required') {
      return "Please log in to continue";
    }
    if (message === 'access_denied') {
      return "Access denied. You need admin credentials to access this area.";
    }
    return "";
  };

  const infoMessage = getInfoMessage();

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

          {/* Info Message from URL */}
          {infoMessage && (
            <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
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
                disabled={isLoading}
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
                  disabled={isLoading}
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
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
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
