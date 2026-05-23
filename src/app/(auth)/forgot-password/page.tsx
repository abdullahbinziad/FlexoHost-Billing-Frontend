"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import { isValidEmail } from "@/lib/security";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const { forgotPassword, isLoading } = useAuth();
    const { theme } = useTheme();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        // Validate email format
        if (!email || !isValidEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        try {
            await forgotPassword(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Failed to send reset email. Please try again.");
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

                {/* Forgot Password Card */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-8">
                    <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                        Forgot Password
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    {success ? (
                        <div className="space-y-4">
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                                Password reset instructions have been sent to your email address.
                            </div>

                            <Link
                                href="/login"
                                className="block text-center text-primary hover:underline"
                            >
                                Back to Login
                            </Link>
                        </div>
                    ) : (
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
                                    required
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? "Sending..." : "Send Reset Link"}
                            </Button>

                            {/* Back to Login Link */}
                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
