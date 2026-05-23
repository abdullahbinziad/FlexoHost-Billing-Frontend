/**
 * Normalize billing cycle strings for comparing promo allow-lists with product option ids.
 */
export function normalizeBillingCycleKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s_-]+/g, "");
}
