const PURCHASE_EXACT_PATHS = [
  "/hosting",
  "/vps",
  "/checkout",
] as const;

const PURCHASE_DOMAIN_PATHS = [
  "/domains/register",
  "/domains/transfers",
] as const;

/**
 * Decide if the currency switcher should be visible for a given route.
 *
 * Intent:
 * - Show only when user is in a purchase / pricing context (seeing product prices
 *   and potentially changing currency before buying).
 * - Hide in generic dashboards, tickets, invoices, account pages, etc.
 */
export function shouldShowCurrencySwitcher(pathname: string | null): boolean {
  if (!pathname) return false;

  const path = pathname.split("?")[0];

  if (PURCHASE_EXACT_PATHS.includes(path as (typeof PURCHASE_EXACT_PATHS)[number])) {
    return true;
  }

  if (PURCHASE_DOMAIN_PATHS.includes(path as (typeof PURCHASE_DOMAIN_PATHS)[number])) {
    return true;
  }

  return false;
}

