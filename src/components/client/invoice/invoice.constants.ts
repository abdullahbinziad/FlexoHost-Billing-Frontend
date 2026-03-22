/**
 * Invoice-related constants
 */

export const PAYMENT_METHODS = [
  { id: "sslcommerz", name: "SSLCommerz - Nagad, Rocket, Upay & BD Cards" },
  { id: "bkash", name: "bKash Payment" },
] as const;

export const A4_DIMENSIONS = {
  widthMm: 210,
  heightMm: 297,
} as const;
