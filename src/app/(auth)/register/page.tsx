"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import { isValidEmail } from "@/lib/security";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { countries } from "@/data/countries";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
    // Personal Information
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

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

            // Use the new registerClient method
            await registerClient(registrationData);
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
            <div className="w-full max-w-2xl">
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
                                    <PhoneInput
                                        international
                                        defaultCountry="BD"
                                        value={phoneNumber}
                                        onChange={(value) => setPhoneNumber(value || "")}
                                        className="phone-input-custom"
                                        disabled={isLoading}
                                        required
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
                                href="/login"
                                className="text-primary hover:underline font-medium"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        /* Custom styles for PhoneInput to match our design */
        .phone-input-custom .PhoneInputInput {
          width: 100%;
          padding: 0.5rem 1rem;
          border: 1px solid rgb(209 213 219);
          border-radius: 0.5rem;
          background-color: white;
          color: rgb(17 24 39);
          font-size: 1rem;
          line-height: 1.5rem;
        }

        .dark .phone-input-custom .PhoneInputInput {
          border-color: rgb(75 85 99);
          background-color: rgb(17 24 39);
          color: rgb(243 244 246);
        }

        .phone-input-custom .PhoneInputInput:focus {
          outline: none;
          ring: 2px;
          ring-color: var(--primary);
          border-color: transparent;
        }

        .phone-input-custom .PhoneInputCountrySelect {
          margin-right: 0.5rem;
          padding: 0.5rem;
          border: 1px solid rgb(209 213 219);
          border-radius: 0.5rem;
          background-color: white;
          color: rgb(17 24 39);
        }

        .dark .phone-input-custom .PhoneInputCountrySelect {
          border-color: rgb(75 85 99);
          background-color: rgb(17 24 39);
          color: rgb(243 244 246);
        }

        .phone-input-custom .PhoneInputCountryIcon {
          width: 1.5rem;
          height: 1.5rem;
          margin-right: 0.5rem;
        }

        .phone-input-custom .PhoneInputCountrySelectArrow {
          opacity: 0.6;
          margin-left: 0.25rem;
        }

        .phone-input-custom {
          display: flex;
          align-items: center;
        }
      `}</style>
        </div>
    );
}
