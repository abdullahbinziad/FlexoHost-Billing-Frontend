import type { GrantScope, GrantPermission } from "@/types/grant-access";

export const SCOPE_LABELS: Record<GrantScope, string> = {
  all: "All services",
  service_type: "By service type",
  specific_services: "Specific services",
};

export const SERVICE_TYPES = [
  { value: "HOSTING", label: "Hosting" },
  { value: "VPS", label: "VPS" },
  { value: "DOMAIN", label: "Domain" },
  { value: "EMAIL", label: "Email" },
  { value: "LICENSE", label: "License" },
] as const;

export const PERMISSION_LABELS: Record<GrantPermission, string> = {
  view: "View",
  manage: "Manage (login, create emails, etc.)",
};

/** Access area checkboxes when creating a grant. */
export const ACCESS_AREA_LABELS: Record<"invoices" | "tickets" | "orders", string> = {
  invoices: "Invoices",
  tickets: "Support tickets",
  orders: "Orders & billing history",
};
