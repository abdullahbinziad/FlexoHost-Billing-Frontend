/**
 * Mock Domain Data for Frontend Development
 * Replace with API calls later
 */

import type { Domain, DomainProtectionOffer } from "@/types/domain";

export const mockDomains: Domain[] = [
  {
    id: "1",
    name: "shodeshbazar.shop",
    status: "active",
    expirationDate: "2026-05-20",
    autoRenewal: false,
    registrationDate: "2024-05-20",
    registrar: "Example Registrar",
  },
  {
    id: "2",
    name: "example.com",
    status: "active",
    expirationDate: "2026-12-15",
    autoRenewal: true,
    registrationDate: "2023-12-15",
    registrar: "Example Registrar",
  },
  {
    id: "3",
    name: "testdomain.net",
    status: "expired",
    expirationDate: "2025-01-10",
    autoRenewal: false,
    registrationDate: "2022-01-10",
    registrar: "Example Registrar",
  },
  {
    id: "4",
    name: "mydomain.org",
    status: "pending",
    expirationDate: "2027-03-25",
    autoRenewal: true,
    registrationDate: "2024-03-25",
    registrar: "Example Registrar",
  },
];

export const mockProtectionOffer: DomainProtectionOffer = {
  domain: "shodeshbazar.net",
  originalPrice: 17.99,
  discountedPrice: 11.99,
  discountPercentage: 33,
  currency: "USD",
  period: "1st yr",
};
