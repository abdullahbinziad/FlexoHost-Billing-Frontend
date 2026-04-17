import type { HostingService } from "@/types/hosting";

type PendingReason = HostingService["pendingReason"];

export function getPendingStatusLabel(
  status: HostingService["status"] | string | undefined,
  pendingReason: PendingReason | undefined
): string {
  const normalizedStatus = String(status || "").toLowerCase();
  const isPendingLike = normalizedStatus === "pending" || normalizedStatus === "provisioning";
  if (!isPendingLike) return String(status || "");

  if (pendingReason === "unpaid_invoice") return "Pending (Unpaid Invoice)";
  return "Pending (Waiting for Activation)";
}
