/**
 * Mock Hosting Service Details for Management Page
 * Replace with API calls later
 */

import type { HostingServiceDetails } from "@/types/hosting-manage";

export const mockHostingServiceDetails: Record<string, HostingServiceDetails> = {
  "1": {
    id: "1",
    name: "Business Plan SH",
    identifier: "salamandbrothers.org",
    domain: "salamandbrothers.org",
    packageName: "Web Hosting - Business Plan SH",
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
    usage: {
      disk: {
        used: 690,
        total: 10240,
        lastUpdated: "2026-01-26T03:40:00Z",
      },
      bandwidth: {
        used: 227.62,
        total: "unlimited",
        lastUpdated: "2026-01-26T03:40:00Z",
      },
    },
    billing: {
      firstPaymentAmount: 2604,
      recurringAmount: 3720,
      billingCycle: "Annually",
      paymentMethod: "SSLCommerz Online Payment Gateway",
      registrationDate: "2026-01-19",
      nextDueDate: "2027-01-19",
    },
  },
  "2": {
    id: "2",
    name: "BDIX RAMADAN VM 2",
    identifier: "bd.mattermaze.com",
    domain: "bd.mattermaze.com",
    packageName: "VPS - BDIX RAMADAN VM 2",
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
    usage: {
      disk: {
        used: 1200,
        total: 20480,
        lastUpdated: "2025-11-28T00:00:00Z",
      },
      bandwidth: {
        used: 500,
        total: "unlimited",
        lastUpdated: "2025-11-28T00:00:00Z",
      },
    },
    billing: {
      firstPaymentAmount: 5000,
      recurringAmount: 5000,
      billingCycle: "Annually",
      paymentMethod: "SSLCommerz Online Payment Gateway",
      registrationDate: "2024-11-28",
      nextDueDate: "2025-11-28",
    },
  },
  "3": {
    id: "3",
    name: "BDIX Intel",
    identifier: "server25.flexohost.com",
    domain: "server25.flexohost.com",
    packageName: "Web Hosting - BDIX Intel",
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
    usage: {
      disk: {
        used: 450,
        total: 5120,
        lastUpdated: "2026-01-26T10:30:00Z",
      },
      bandwidth: {
        used: 150.5,
        total: "unlimited",
        lastUpdated: "2026-01-26T10:30:00Z",
      },
    },
    billing: {
      firstPaymentAmount: 2500,
      recurringAmount: 2500,
      billingCycle: "Annually",
      paymentMethod: "SSLCommerz Online Payment Gateway",
      registrationDate: "2025-06-15",
      nextDueDate: "2026-06-15",
    },
  },
  "4": {
    id: "4",
    name: "BDIX Server",
    identifier: "srv1.shamaztrading.com",
    domain: "srv1.shamaztrading.com",
    packageName: "Web Hosting - BDIX Server",
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
    usage: {
      disk: {
        used: 850,
        total: 10240,
        lastUpdated: "2026-01-26T08:15:00Z",
      },
      bandwidth: {
        used: 320.75,
        total: "unlimited",
        lastUpdated: "2026-01-26T08:15:00Z",
      },
    },
    billing: {
      firstPaymentAmount: 3000,
      recurringAmount: 3000,
      billingCycle: "Annually",
      paymentMethod: "SSLCommerz Online Payment Gateway",
      registrationDate: "2025-08-20",
      nextDueDate: "2026-08-20",
    },
  },
};
