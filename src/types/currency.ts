/**
 * Currency Type Definitions
 */

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  locale?: string;
}

// Default currencies - Add more currencies here
export const DEFAULT_CURRENCIES: Currency[] = [
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    locale: "en-US",
  },
  {
    code: "BDT",
    name: "Bangladeshi Taka",
    symbol: "৳",
    locale: "bn-BD",
  },
  // Add more currencies here as needed
  // Example:
  // {
  //   code: "EUR",
  //   name: "Euro",
  //   symbol: "€",
  //   locale: "de-DE",
  // },
];
