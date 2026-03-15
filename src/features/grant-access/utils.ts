import type { AccessGrant } from "@/types/grant-access";
import { SCOPE_LABELS, SERVICE_TYPES } from "./constants";

export function formatGrantee(grant: AccessGrant): string {
  const u = grant.granteeUserId;
  if (typeof u === "object" && u !== null && "email" in u) return u.email ?? "—";
  return "—";
}

export function formatScope(grant: AccessGrant): string {
  if (grant.scope === "all") return "All services";
  if (grant.scope === "service_type" && grant.serviceType) {
    const t = SERVICE_TYPES.find((x) => x.value === grant.serviceType);
    return t ? t.label : grant.serviceType;
  }
  if (grant.scope === "specific_services" && grant.serviceIds?.length)
    return `${grant.serviceIds.length} service(s)`;
  return SCOPE_LABELS[grant.scope] ?? grant.scope;
}

export function formatExpiry(expiresAt?: string | null): string {
  if (!expiresAt) return "No expiry";
  try {
    return new Date(expiresAt).toLocaleDateString();
  } catch {
    return "—";
  }
}

export function formatPermissions(grant: AccessGrant): string {
  return grant.permissions?.includes("manage") ? "View, Manage" : "View";
}

/** Format access areas (invoices, tickets, orders) for display. */
export function formatAccessAreas(grant: AccessGrant): string {
  const inv = grant.allowInvoices !== false;
  const tick = grant.allowTickets !== false;
  const ord = grant.allowOrders !== false;
  if (inv && tick && ord) return "Invoices, Tickets, Orders";
  const parts: string[] = [];
  if (inv) parts.push("Invoices");
  if (tick) parts.push("Tickets");
  if (ord) parts.push("Orders");
  return parts.length ? parts.join(", ") : "None";
}
