/**
 * Domain Management Page Type Definitions
 */

import type { Domain } from "./domain";

export interface DomainDetails extends Domain {
  sslStatus: "active" | "inactive" | "expired";
  nameservers: string[];
  registrarLock: boolean;
  eppCode?: string;
  billing: {
    firstPaymentAmount: number;
    recurringAmount: number;
    billingCycle: string;
    paymentMethod: string;
    registrationDate: string;
    nextDueDate: string;
  };
  contacts: {
    registrant: ContactInfo;
    admin: ContactInfo;
    tech: ContactInfo;
    billing: ContactInfo;
  };
  dnsRecords?: DNSRecord[];
  emailForwarding?: EmailForward[];
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface DNSRecord {
  id: string;
  type: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS";
  name: string;
  value: string;
  ttl: number;
}

export interface EmailForward {
  id: string;
  from: string;
  to: string[];
}

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  section?: string;
}
