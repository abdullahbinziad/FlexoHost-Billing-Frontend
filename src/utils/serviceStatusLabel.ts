import type { HostingService } from "@/types/hosting";
import { SERVICE_STATUS, normalizeServiceStatus } from "@/constants/serviceStatus";

type PendingReason = HostingService["pendingReason"];

export function getPendingStatusLabel(
  status: HostingService["status"] | string | undefined,
  pendingReason: PendingReason | undefined
): string {
  const normalizedStatus = normalizeServiceStatus(status);
  const isPendingLike =
    normalizedStatus === SERVICE_STATUS.PENDING ||
    normalizedStatus === SERVICE_STATUS.PROVISIONING;
  if (!isPendingLike) return String(status || "");

  if (pendingReason === "unpaid_invoice") return "Pending (Unpaid Invoice)";
  return "Pending (Waiting for Activation)";
}
