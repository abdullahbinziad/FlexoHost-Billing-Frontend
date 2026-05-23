"use client";

import { useCurrency } from "./useCurrency";
import { formatCurrency as formatCurrencyUtil } from "@/utils/format";

/**
 * Hook to format currency.
 * - For stored data (invoices, orders, transactions, etc.): ALWAYS pass currency from API response.
 * - For live prices (checkout, product browsing): Omit currency to use selectedCurrency.
 */
export const useFormatCurrency = () => {
  const { selectedCurrency } = useCurrency();

  return (amount: number, currency?: string) => {
    return formatCurrencyUtil(amount, currency || selectedCurrency.code);
  };
};
