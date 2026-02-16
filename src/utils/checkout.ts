/**
 * Checkout utility functions
 */

import type { BillingCycleOption } from "@/types/checkout";

export const calculateSavings = (
  originalPrice: number,
  currentPrice: number
): { amount: number; percentage: number } => {
  const amount = originalPrice - currentPrice;
  const percentage = Math.round((amount / originalPrice) * 100);
  return { amount, percentage };
};

export const getBillingCycleLabel = (
  cycle: string
): { short: string; long: string } => {
  const labels: Record<string, { short: string; long: string }> = {
    monthly: { short: "/mo", long: "Monthly" },
    annually: { short: "/yr", long: "Annually" },
    biennially: { short: "/2yr", long: "Biennially" },
    triennially: { short: "/3yr", long: "Triennially" },
  };
  return labels[cycle] || { short: "", long: cycle };
};

export const validateDomainName = (domain: string): boolean => {
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
  return domainRegex.test(domain);
};

export const formatDomainName = (domain: string, tld: string): string => {
  const cleanDomain = domain.trim().toLowerCase();
  return `${cleanDomain}${tld}`;
};
