/**
 * Hosting Service Type Definitions
 */

export interface HostingService {
  id: string;
  name: string;
  identifier: string;
  status: "active" | "expired" | "suspended" | "pending" | "terminated" | "provisioning";
  expiredDaysAgo?: number;
  renewalDate?: string;
  expirationDate: string;
  nextDueDate?: string;
  /** ISO date string when service was suspended (for admin tracking) */
  suspendedAt?: string;
  /** ISO date string when service was terminated (for admin tracking) */
  terminatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  graceUntil?: string;
  autoSuspendAt?: string;
  autoTerminateAt?: string;
  pricing: {
    amount: number;
    currency: string;
    billingCycle: "monthly" | "quarterly" | "semi-annually" | "annually" | "biennially" | "triennially";
  };
  productType: "hosting" | "vps" | "dedicated" | "domain" | "email" | "license";
  serverLocation?: string;
}

export interface ServicesRenewingSoon {
  count: number;
  services: HostingService[];
}
