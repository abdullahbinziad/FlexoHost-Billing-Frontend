import type { Domain } from "@/types/domain";
import type { InvoiceStatus } from "@/types/invoice";
import type { Order } from "@/types/admin";
import type { TLD } from "@/types/admin/tld";

export const ORDER_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  CANCELLED: "cancelled",
  FRAUD: "fraud",
  PROCESSING: "processing",
  ON_HOLD: "on_hold",
  DRAFT: "draft",
} as const;

export const ORDER_PAYMENT_STATUS = {
  PAID: "paid",
  UNPAID: "unpaid",
  REFUNDED: "refunded",
  INCOMPLETE: "incomplete",
} as const;

export const INVOICE_STATUS = {
  UNPAID: "unpaid",
  PAID: "paid",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
  PENDING: "pending",
} as const;

export const INVOICE_STATUS_ADMIN = {
  PAID: "PAID",
  UNPAID: "UNPAID",
  OVERDUE: "OVERDUE",
  CANCELLED: "CANCELLED",
} as const;

export const DOMAIN_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  PENDING: "pending",
  SUSPENDED: "suspended",
} as const;

export const TLD_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  MAINTENANCE: "maintenance",
} as const;

export const DOMAIN_SYNC_STATE = {
  FRESH: "fresh",
  STALE: "stale",
  NEVER: "never",
  FAILED: "failed",
} as const;

export const PAYMENT_REDIRECT_STATUS = {
  SUCCESS: "success",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export const AUTOMATION_RUN_STATUS = {
  RUNNING: "running",
  SUCCESS: "success",
  FAILURE: "failure",
} as const;

export const MODULE_TYPE = {
  CPANEL: "cpanel",
  DIRECTADMIN: "directadmin",
  PLESK: "plesk",
  VIRTUALIZOR: "virtualizor",
  NONE: "none",
} as const;

export const REGISTRAR_PROVIDER = {
  DYNADOT: "Dynadot",
  NAMELY: "namely",
  NONE: "None",
} as const;

export const SELECT_SENTINEL = {
  NONE: "__none__",
  ALL: "__all__",
  AUTO: "__auto__",
} as const;

export const TICKET_DEPARTMENT = {
  SUPPORT: "support",
  TECHNICAL: "technical",
  BILLING: "billing",
  SALES: "sales",
} as const;

export const TICKET_PRIORITY = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export const AFFILIATE_PROFILE_STATUS = {
  ACTIVE: "active",
  PAUSED: "paused",
} as const;

export const TICKET_STATUS = {
  OPEN: "open",
  ANSWERED: "answered",
  CUSTOMER_REPLY: "customer_reply",
  ON_HOLD: "on_hold",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

export type OrderStatusValue = Order["status"];
export type OrderPaymentStatusValue = Order["paymentStatus"];
export type InvoiceStatusValue = InvoiceStatus;
export type DomainStatusValue = Domain["status"];
export type TldStatusValue = TLD["status"];
