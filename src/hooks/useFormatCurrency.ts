"use client";

import { useCurrency } from "./useCurrency";
import { formatCurrency as formatCurrencyUtil } from "@/utils/format";

/**
 * Hook to format currency using the selected global currency
 */
export const useFormatCurrency = () => {
  const { selectedCurrency } = useCurrency();

  return (amount: number, currency?: string) => {
    return formatCurrencyUtil(amount, currency || selectedCurrency.code);
  };
};
