/**
 * Hosting Service Type Definitions
 */

export interface HostingService {
  id: string;
  name: string;
  identifier: string;
  status: "active" | "expired" | "suspended" | "pending";
  expiredDaysAgo?: number;
  renewalDate?: string;
  expirationDate: string;
  nextDueDate?: string;
  pricing: {
    amount: number;
    currency: string;
    billingCycle: "monthly" | "quarterly" | "semi-annually" | "annually" | "biennially" | "triennially";
  };
  productType: "hosting" | "vps" | "dedicated";
  serverLocation?: string;
}

export interface ServicesRenewingSoon {
  count: number;
  services: HostingService[];
}
