/**
 * Grant Access feature – shared types and helpers.
 * Single source of truth for scope, permissions, and grant shape.
 */

export type GrantScope = "all" | "service_type" | "specific_services";
export type GrantPermission = "view" | "manage";

/** Populated client ref from API */
export interface GrantClientRef {
  _id: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  contactEmail?: string;
}

/** Populated user ref from API */
export interface GrantUserRef {
  _id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

/** Which areas the grantee can access when managing the account. */
export interface GrantAccessAreas {
  invoices: boolean;
  tickets: boolean;
  orders: boolean;
}

export interface AccessGrant {
  _id: string;
  clientId: string | GrantClientRef;
  granteeUserId: string | GrantUserRef;
  createdByUserId: string | GrantUserRef;
  scope: GrantScope;
  serviceType?: string;
  serviceIds?: string[];
  permissions: GrantPermission[];
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  /** Granular access: invoices, tickets, orders. Omitted = true (backward compat). */
  allowInvoices?: boolean;
  allowTickets?: boolean;
  allowOrders?: boolean;
}

export interface CreateGrantRequest {
  granteeEmail: string;
  scope: GrantScope;
  serviceType?: string;
  serviceIds?: string[];
  permissions?: GrantPermission[];
  expiresAt?: string | null;
  allowInvoices?: boolean;
  allowTickets?: boolean;
  allowOrders?: boolean;
}

/** Update existing grant (no grantee change). */
export interface UpdateGrantRequest {
  scope: GrantScope;
  serviceType?: string;
  serviceIds?: string[];
  permissions?: GrantPermission[];
  expiresAt?: string | null;
  allowInvoices?: boolean;
  allowTickets?: boolean;
  allowOrders?: boolean;
}

/** Resolve client id from grant (populated or raw). */
export function getGrantClientId(grant: AccessGrant): string {
  const c = grant.clientId;
  return typeof c === "object" && c !== null && "_id" in c ? c._id : String(c);
}

/** Get display name for grant's client (for shared-with-me). */
export function getClientDisplayName(grant: AccessGrant): string {
  const c = grant.clientId;
  if (typeof c !== "object" || c === null) return "Client";
  const parts = [c.firstName, c.lastName].filter(Boolean);
  if (parts.length) return parts.join(" ");
  if (c.companyName) return c.companyName;
  if (c.contactEmail) return c.contactEmail;
  return "Shared client";
}
