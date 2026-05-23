/**
 * Mock Hosting Services Data for Frontend Development
 * Replace with API calls later
 */

import type { HostingService } from "@/types/hosting";

export const mockHostingServices: HostingService[] = [
  {
    id: "1",
    name: "Business Plan SH",
    identifier: "salamandbrothers.org",
    status: "active",
    expirationDate: "2027-01-19",
    nextDueDate: "2027-01-19",
    renewalDate: "2027-01-19",
    pricing: {
      amount: 3720,
      currency: "BDT",
      billingCycle: "annually",
    },
    productType: "hosting",
    serverLocation: "Bangladesh",
  },
  {
    id: "2",
    name: "BDIX RAMADAN VM 2",
    identifier: "bd.mattermaze.com",
    status: "expired",
    expiredDaysAgo: 59,
    expirationDate: "2025-11-28",
    nextDueDate: "2025-11-28",
    pricing: {
      amount: 5000,
      currency: "BDT",
      billingCycle: "annually",
    },
    productType: "vps",
    serverLocation: "Bangladesh",
  },
  {
    id: "3",
    name: "BDIX Intel",
    identifier: "server25.flexohost.com",
    status: "active",
    expirationDate: "2026-06-15",
    nextDueDate: "2026-06-15",
    renewalDate: "2026-06-01",
    pricing: {
      amount: 2500,
      currency: "BDT",
      billingCycle: "annually",
    },
    productType: "hosting",
    serverLocation: "Bangladesh",
  },
  {
    id: "4",
    name: "BDIX Server",
    identifier: "srv1.shamaztrading.com",
    status: "active",
    expirationDate: "2026-08-20",
    nextDueDate: "2026-08-20",
    renewalDate: "2026-08-05",
    pricing: {
      amount: 3000,
      currency: "BDT",
      billingCycle: "annually",
    },
    productType: "hosting",
    serverLocation: "Bangladesh",
  },
];

export const mockServicesRenewingSoon: HostingService[] = [
  mockHostingServices[0],
  mockHostingServices[2],
  mockHostingServices[3],
];
