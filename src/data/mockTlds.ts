/**
 * Mock TLD Pricing Data for Frontend Development
 * Replace with API calls later
 */

export interface TldPricing {
  tld: string;
  originalPrice: number;
  discountedPrice: number;
  currency: string;
}

export const mockTldPricing: TldPricing[] = [
  {
    tld: ".com",
    originalPrice: 19.99,
    discountedPrice: 0.01,
    currency: "USD",
  },
  {
    tld: ".net",
    originalPrice: 17.99,
    discountedPrice: 11.99,
    currency: "USD",
  },
  {
    tld: ".io",
    originalPrice: 67.99,
    discountedPrice: 31.99,
    currency: "USD",
  },
  {
    tld: ".org",
    originalPrice: 15.99,
    discountedPrice: 7.99,
    currency: "USD",
  },
  {
    tld: ".online",
    originalPrice: 35.99,
    discountedPrice: 0.99,
    currency: "USD",
  },
  {
    tld: ".shop",
    originalPrice: 34.99,
    discountedPrice: 0.99,
    currency: "USD",
  },
];
