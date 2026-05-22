/**
 * Formatting utility functions
 */

import type { Currency } from "@/types/currency";

export const formatCurrency = (
  amount: number,
  currency?: string | Currency
): string => {
  let currencyCode = "USD";
  let locale = "en-US";
  let symbol = "$";

  if (typeof currency === "string") {
    currencyCode = currency;
  } else if (currency) {
    currencyCode = currency.code;
    locale = currency.locale || "en-US";
    symbol = currency.symbol;
  }

  // BDT: Use "TK" as prefix (frontend display preference)
  if (currencyCode === "BDT") {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `TK ${formatted}`;
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback if currency code is invalid - use code as string
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
};

export const formatDate = (
  date: string | Date,
  format: "long" | "short" | "full" = "long"
): string => {
  if (!date) return "N/A";
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "N/A";

  if (format === "short") {
    // Format: YYYY-MM-DD (e.g., "2026-05-20")
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  if (format === "full") {
    // Format: "Tuesday, January 19th, 2027"
    const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(dateObj);
    const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(dateObj);
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();

    // Add ordinal suffix (st, nd, rd, th)
    const getOrdinal = (n: number): string => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${dayName}, ${monthName} ${getOrdinal(day)}, ${year}`;
  }

  // Format: "May 20, 2026"
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
};

/** Relative time e.g. "2 min ago", "1 hour ago", "Yesterday" */
export const formatRelativeTime = (date: string | Date): string => {
  if (!date) return "";
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  return formatDate(date, "short");
};

export const formatDateTime = (date: string | Date): string => {
  if (!date) return "N/A";
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
};
