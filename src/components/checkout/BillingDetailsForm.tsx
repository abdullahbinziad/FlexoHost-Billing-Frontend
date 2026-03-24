"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { countries } from "@/data/countries";
import type { BillingContact, NewAccountInfo } from "@/types/checkout";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS } from "@/config/api";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

interface BillingDetailsFormProps {
  contacts: BillingContact[];
  selectedContactId: string;
  onSelect: (contactId: string) => void;
  onCreateNew?: () => void;
  onNewAccountChange?: (info: NewAccountInfo | null) => void;
}

export function BillingDetailsForm({
  contacts,
  selectedContactId,
  onSelect,
  onCreateNew,
  onNewAccountChange,
}: BillingDetailsFormProps) {
  const { isAuthenticated, login, isLoading, user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const checkoutRedirect = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const [isCreatingNew, setIsCreatingNew] = useState(contacts.length === 0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [guestMode, setGuestMode] = useState<"login" | "register">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Registration form state — fully controlled
  const [regData, setRegData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    password: "",
    confirmPassword: "",
  });

  const updateRegField = (field: string, value: string) => {
    setRegData((prev) => ({ ...prev, [field]: value }));
  };

  // Emit new account info whenever registration data changes
  useEffect(() => {
    if (!isAuthenticated && guestMode === "register") {
      if (regData.firstName && regData.lastName && regData.email && regData.password) {
        onNewAccountChange?.({
          firstName: regData.firstName,
          lastName: regData.lastName,
          email: regData.email,
          phone: regData.phone,
          company: regData.company || undefined,
          password: regData.password,
          address: {
            street: regData.street,
            city: regData.city,
            state: regData.state,
            zipCode: regData.zipCode,
            country: regData.country,
          },
        });
      } else {
        onNewAccountChange?.(null);
      }
    } else {
      onNewAccountChange?.(null);
    }
  }, [regData, isAuthenticated, guestMode]);

  useEffect(() => {
    if (isAuthenticated) {
      if (contacts.length === 0) {
        setIsCreatingNew(true);
      }
    } else {
      if (guestMode === "register") {
        setIsCreatingNew(true);
      } else {
        setIsCreatingNew(false);
      }
    }
  }, [contacts.length, isAuthenticated, guestMode]);

  const handleSelect = (id: string) => {
    setIsCreatingNew(false);
    onSelect(id);
  };

  const handleCreateNew = () => {
    setIsCreatingNew(true);
    if (onCreateNew) onCreateNew();
  };

  const handleLoginSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      await login(loginEmail, loginPassword, "NO_REDIRECT");
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials");
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors";

  const renderRegistrationForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name *</label>
        <input type="text" className={inputClass} placeholder="John" value={regData.firstName} onChange={(e) => updateRegField("firstName", e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name *</label>
        <input type="text" className={inputClass} placeholder="Doe" value={regData.lastName} onChange={(e) => updateRegField("lastName", e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address *</label>
        <input type="email" className={inputClass} placeholder="john@example.com" value={regData.email} onChange={(e) => updateRegField("email", e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number *</label>
        <div className="w-full flex items-center border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-colors">
          <PhoneInput
            country={"bd"}
            value={regData.phone}
            onChange={(phone) => updateRegField("phone", phone)}
            containerClass="flex-1 w-full"
            inputClass="!w-full !h-full !bg-transparent !border-none !text-gray-900 dark:!text-gray-100 !px-3 !py-2 !pl-[52px] !focus:ring-0 !focus:outline-none !shadow-none"
            buttonClass="!bg-transparent !border-none !shadow-none hover:!bg-transparent focus:!bg-transparent"
          />
        </div>
      </div>
      <div className="space-y-1 md:col-span-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Name (Optional)</label>
        <input type="text" className={inputClass} placeholder="Company LLC" value={regData.company} onChange={(e) => updateRegField("company", e.target.value)} />
      </div>
      <div className="space-y-1 md:col-span-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Street Address *</label>
        <input type="text" className={inputClass} placeholder="123 Main St" value={regData.street} onChange={(e) => updateRegField("street", e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">City *</label>
        <input type="text" className={inputClass} placeholder="New York" value={regData.city} onChange={(e) => updateRegField("city", e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">State / Region *</label>
        <input type="text" className={inputClass} placeholder="NY" value={regData.state} onChange={(e) => updateRegField("state", e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Zip / Postal Code *</label>
        <input type="text" className={inputClass} placeholder="10001" value={regData.zipCode} onChange={(e) => updateRegField("zipCode", e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Country *</label>
        <select className={inputClass} value={regData.country} onChange={(e) => updateRegField("country", e.target.value)}>
          <option value="">Select a country</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password *</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            placeholder="••••••••"
            value={regData.password}
            onChange={(e) => updateRegField("password", e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password *</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            placeholder="••••••••"
            value={regData.confirmPassword}
            onChange={(e) => updateRegField("confirmPassword", e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Billing Details
      </h2>
      <div className="space-y-3">
        {isAuthenticated && user ? (
          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg uppercase">
                {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
              </div>
              <div>
                <p className="text-sm font-medium text-primary mb-1">
                  Logged in as
                </p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {user.name || "My Account"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setGuestMode("login")}
                className={cn(
                  "flex-1 py-3 text-sm font-medium transition-colors",
                  guestMode === "login"
                    ? "bg-primary/10 text-primary border-b-2 border-primary"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                )}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setGuestMode("register")}
                className={cn(
                  "flex-1 py-3 text-sm font-medium transition-colors",
                  guestMode === "register"
                    ? "bg-primary/10 text-primary border-b-2 border-primary"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                )}
              >
                New Account
              </button>
            </div>

            <div className="p-0">
              {guestMode === "login" ? (
                <div className="p-6 md:p-8 space-y-4">
                  {loginError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center">
                      {loginError}
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row items-end gap-4 w-full pt-2">
                    <div className="flex-1 w-full space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full px-4 h-12 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder-gray-400"
                        placeholder="name@example.com"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleLoginSubmit(e as any);
                          }
                        }}
                      />
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full pl-4 pr-12 h-12 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder-gray-400"
                          placeholder="••••••••"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleLoginSubmit(e as any);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none rounded"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="w-full md:w-32 lg:w-40 pt-2 md:pt-0">
                      <button
                        type="button"
                        onClick={handleLoginSubmit}
                        disabled={isLoading}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          "Sign In"
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="px-6 md:px-8 pb-6">
                    <div className="relative flex items-center gap-2 my-4">
                      <span className="flex-1 border-t border-gray-200 dark:border-gray-600" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Or</span>
                      <span className="flex-1 border-t border-gray-200 dark:border-gray-600" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const url = checkoutRedirect
                          ? `${API_ENDPOINTS.AUTH.GOOGLE}?state=${encodeURIComponent(checkoutRedirect)}`
                          : API_ENDPOINTS.AUTH.GOOGLE;
                        window.location.href = url;
                      }}
                      disabled={isLoading}
                      className="w-full h-12 flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors disabled:opacity-70"
                    >
                      <GoogleIcon />
                      Sign in with Google
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 md:p-8 space-y-4">
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const url = checkoutRedirect
                          ? `${API_ENDPOINTS.AUTH.GOOGLE}?state=${encodeURIComponent(checkoutRedirect)}`
                          : API_ENDPOINTS.AUTH.GOOGLE;
                        window.location.href = url;
                      }}
                      disabled={isLoading}
                      className="w-full h-12 flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors disabled:opacity-70"
                    >
                      <GoogleIcon />
                      Sign up with Google
                    </button>
                    <div className="relative flex items-center gap-2 my-2">
                      <span className="flex-1 border-t border-gray-200 dark:border-gray-600" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Or create with email</span>
                      <span className="flex-1 border-t border-gray-200 dark:border-gray-600" />
                    </div>
                  </div>
                  {renderRegistrationForm()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
