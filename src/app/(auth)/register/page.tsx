"use client";

import { useState, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import { isValidEmail } from "@/lib/security";
import { API_ENDPOINTS } from "@/config/api";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { countries } from "@/data/countries";
import { Eye, EyeOff } from "lucide-react";

function RegisterPageContent() {
    // Personal Information
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [company, setCompany] = useState("");

    // Billing Address
    const [streetAddress, setStreetAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [postcode, setPostcode] = useState("");
    const [country, setCountry] = useState("BD"); // Bangladesh ISO code

    // Account Security
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const { registerClient, isLoading } = useAuth();
    const { theme } = useTheme();
    const searchParams = useSearchParams();
    const redirectAfterSignup = searchParams.get("redirect") ?? undefined;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation - Required fields
        if (!firstName || !lastName || !email || !phoneNumber || !password) {
            setError("Please fill in all required fields");
            return;
        }

        // Email validation
        if (!isValidEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        // Phone validation
        if (phoneNumber.length < 10) {
            setError("Please enter a valid phone number");
            return;
        }

        // Password validation
        if (password.length < 5) {
            setError("Password must be at least 5 characters long");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            // Prepare client registration data according to backend API
            const registrationData = {
                userData: {
                    email,
                    password,
                },
                clientData: {
                    firstName,
                    lastName,
                    companyName: company,
                    contactEmail: email,
                    phoneNumber,
                    address: {
                        street: streetAddress,
                        city,
                        state,
                        postCode: postcode,
                        country,
                    },
                },
            };

            await registerClient(registrationData, redirectAfterSignup ?? null);
        } catch (err: any) {
            // Extract detailed error message from the error object
            let errorMessage = "Registration failed. Please try again.";

            if (err?.message) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }

            // Handle specific error cases
            if (errorMessage.toLowerCase().includes('email')) {
                errorMessage = "This email is already registered. Please use a different email or try logging in.";
            } else if (errorMessage.toLowerCase().includes('duplicate')) {
                errorMessage = "An account with this information already exists. Please try logging in.";
            }

            setError(errorMessage);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
            <div className="w-full max-w-3xl">
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

                {/* Registration Card */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-8">
                    <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                        Create Account
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Sign up to get started with FlexoHost
                    </p>

                    {/* Sign up with Google */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 border-gray-300 dark:border-gray-600 mb-6"
                        disabled={isLoading}
                        onClick={() => {
                            const state = redirectAfterSignup ? encodeURIComponent(redirectAfterSignup) : "";
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
                        Sign up with Google
                    </Button>

                    <div className="relative flex items-center gap-2 mb-6">
                        <span className="flex-1 border-t border-gray-200 dark:border-gray-600" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Or create account with email</span>
                        <span className="flex-1 border-t border-gray-200 dark:border-gray-600" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information Section */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* First Name */}
                                <div>
                                    <label
                                        htmlFor="firstName"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                        placeholder="John"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label
                                        htmlFor="lastName"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                        placeholder="Doe"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        Email Address <span className="text-red-500">*</span>
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

                                {/* Phone Number with Country Code */}
                                <div>
                                    <label
                                        htmlFor="phoneNumber"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="w-full flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-colors">
                                        <PhoneInput
                                            country={'bd'}
                                            value={phoneNumber}
                                            onChange={(phone) => setPhoneNumber(phone)}
                                            containerClass="flex-1 w-full"
                                            inputClass="!w-full !h-[42px] !bg-transparent !border-none !text-gray-900 dark:!text-gray-100 !px-4 !py-2 !pl-[52px] !focus:ring-0 !focus:outline-none !shadow-none"
                                            buttonClass="!bg-transparent !border-none !shadow-none hover:!bg-transparent focus:!bg-transparent pl-2"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Company (Optional) */}
                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="company"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        Company (optional)
                                    </label>
                                    <input
                                        id="company"
                                        type="text"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                        placeholder="Company LLC"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Billing Address Section */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Billing Address
                            </h2>
                            <div className="space-y-4">
                                {/* Street Address */}
                                <div>
                                    <label
                                        htmlFor="streetAddress"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        Street Address
                                    </label>
                                    <input
                                        id="streetAddress"
                                        type="text"
                                        value={streetAddress}
                                        onChange={(e) => setStreetAddress(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                        placeholder="123 Main Street"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* City */}
                                    <div>
                                        <label
                                            htmlFor="city"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                        >
                                            City
                                        </label>
                                        <input
                                            id="city"
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                            placeholder="Dhaka"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {/* State */}
                                    <div>
                                        <label
                                            htmlFor="state"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                        >
                                            State
                                        </label>
                                        <input
                                            id="state"
                                            type="text"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                            placeholder="Dhaka Division"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {/* Postcode */}
                                    <div>
                                        <label
                                            htmlFor="postcode"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                        >
                                            Postcode
                                        </label>
                                        <input
                                            id="postcode"
                                            type="text"
                                            value={postcode}
                                            onChange={(e) => setPostcode(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                            placeholder="Enter postcode"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {/* Country */}
                                    <div>
                                        <label
                                            htmlFor="country"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                        >
                                            Country
                                        </label>
                                        <select
                                            id="country"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        >
                                            {countries.map((c) => (
                                                <option key={c.code} value={c.code}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Security Section */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Account Security
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Password */}
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        Password <span className="text-red-500">*</span>
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
                                            required
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
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Minimum 5 characters
                                    </p>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pr-10"
                                            placeholder="••••••••"
                                            disabled={isLoading}
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-500" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-500" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{" "}
                            <Link
                                href={
                                    redirectAfterSignup
                                        ? `/login?redirect=${encodeURIComponent(redirectAfterSignup)}`
                                        : "/login"
                                }
                                className="text-primary hover:underline font-medium"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900" />}>
            <RegisterPageContent />
        </Suspense>
    );
}
