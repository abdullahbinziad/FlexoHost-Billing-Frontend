/**
 * Currency Type Definitions - Central config for supported currencies.
 * To add a new currency: add to SUPPORTED_CURRENCY_CODES and DEFAULT_CURRENCIES.
 */

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  locale?: string;
}

export const SUPPORTED_CURRENCY_CODES = ["BDT", "USD"] as const;

export const DEFAULT_CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", locale: "bn-BD" },
];
