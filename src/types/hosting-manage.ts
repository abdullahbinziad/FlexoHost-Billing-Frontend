/**
 * Hosting Service Management Page Type Definitions
 */

import type { HostingService } from "./hosting";

export interface HostingServiceDetails extends HostingService {
  domain: string;
  packageName: string;
  usage: {
    disk: {
      used: number; // in MB
      total: number; // in MB
      lastUpdated: string;
    };
    bandwidth: {
      used: number; // in MB
      total: number | "unlimited"; // in MB or "unlimited"
      lastUpdated: string;
    };
  };
  billing: {
    firstPaymentAmount: number;
    recurringAmount: number;
    billingCycle: string;
    paymentMethod: string;
    registrationDate: string;
    nextDueDate: string;
    currency?: string;
  };
}

export interface QuickShortcut {
  id: string;
  label: string;
  icon: string; // Icon name or component
  href?: string;
  onClick?: () => void;
}

export interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
  collapsible?: boolean;
}

export interface SidebarItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}
