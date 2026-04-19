import type { HostingService } from "@/types/hosting";

export const SERVICE_STATUS = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  CANCELLED: "CANCELLED",
  TERMINATED: "TERMINATED",
  PROVISIONING: "PROVISIONING",
  PENDING: "PENDING",
  FAILED: "FAILED",
  EXPIRED: "EXPIRED",
} as const;

export type ServiceStatusValue = (typeof SERVICE_STATUS)[keyof typeof SERVICE_STATUS];

function normalizeRawStatus(raw: unknown): string {
  return String(raw || "").trim().toUpperCase();
}

/**
 * Convert raw service status to canonical uppercase status.
 * Supports legacy aliases and typo/shape variants.
 */
export function normalizeServiceStatus(
  rawStatus: unknown,
  fallbacks?: { suspendedAt?: string; terminatedAt?: string; cancelledAt?: string }
): ServiceStatusValue {
  const raw = normalizeRawStatus(rawStatus);
  let normalizedFromRaw: ServiceStatusValue | null = null;
  if (raw === SERVICE_STATUS.ACTIVE) normalizedFromRaw = SERVICE_STATUS.ACTIVE;
  else if (raw === SERVICE_STATUS.PROVISIONING) normalizedFromRaw = SERVICE_STATUS.PROVISIONING;
  else if (raw === SERVICE_STATUS.PENDING) normalizedFromRaw = SERVICE_STATUS.PENDING;
  else if (raw === SERVICE_STATUS.FAILED) normalizedFromRaw = SERVICE_STATUS.FAILED;
  else if (raw === SERVICE_STATUS.EXPIRED || raw.includes("EXPIRE")) normalizedFromRaw = SERVICE_STATUS.EXPIRED;
  else if (raw === SERVICE_STATUS.SUSPENDED || raw.includes("SUSPEND")) normalizedFromRaw = SERVICE_STATUS.SUSPENDED;
  else if (raw === SERVICE_STATUS.CANCELLED || raw === "CANCELED" || raw.includes("CANCEL")) {
    normalizedFromRaw = SERVICE_STATUS.CANCELLED;
  } else if (raw === SERVICE_STATUS.TERMINATED || raw === "TERMINATE" || raw.includes("TERMINAT")) {
    normalizedFromRaw = SERVICE_STATUS.TERMINATED;
  }

  // Effective current state precedence:
  // terminal states must win even if older status text is stale.
  if (fallbacks?.terminatedAt) return SERVICE_STATUS.TERMINATED;
  if (fallbacks?.cancelledAt && normalizedFromRaw !== SERVICE_STATUS.ACTIVE) return SERVICE_STATUS.CANCELLED;
  if (!normalizedFromRaw && fallbacks?.suspendedAt) return SERVICE_STATUS.SUSPENDED;

  return normalizedFromRaw ?? SERVICE_STATUS.PENDING;
}

/** Convert canonical uppercase status to current frontend hosting status union. */
export function toHostingServiceStatus(status: ServiceStatusValue): HostingService["status"] {
  if (status === SERVICE_STATUS.ACTIVE) return "active";
  if (status === SERVICE_STATUS.SUSPENDED) return "suspended";
  if (status === SERVICE_STATUS.CANCELLED) return "cancelled";
  if (status === SERVICE_STATUS.TERMINATED) return "terminated";
  if (status === SERVICE_STATUS.PROVISIONING) return "provisioning";
  if (status === SERVICE_STATUS.EXPIRED) return "expired";
  return "pending";
}

