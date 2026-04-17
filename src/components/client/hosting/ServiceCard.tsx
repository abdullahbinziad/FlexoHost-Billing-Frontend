"use client";

import { AlertCircle, Check, Lock } from "lucide-react";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { formatDate } from "@/utils/format";
import { getBillingCycleName } from "@/utils/checkout";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { HostingService } from "@/types/hosting";
import { getPendingStatusLabel } from "@/utils/serviceStatusLabel";

interface ServiceTableRowProps {
  service: HostingService;
  onManage: (serviceId: string) => void;
}

const cellBorder =
  "border-r border-gray-100 py-3 align-middle dark:border-gray-800/80";

/** One data row for the hosting services table (used inside TableBody). */
export function ServiceTableRow({ service, onManage }: ServiceTableRowProps) {
  const formatCurrency = useFormatCurrency();
  const isExpired = service.status === "expired";
  const isActive = service.status === "active";

  return (
    <TableRow className="border-b border-gray-100 hover:bg-gray-50/70 dark:border-gray-800/80 dark:hover:bg-gray-800/40">
      <TableCell className={cn(cellBorder, "w-12 px-2 text-center")}>
        <div className="flex justify-center">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-red-100 dark:bg-red-900/30">
            <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </TableCell>
      <TableCell className={cn(cellBorder, "max-w-[14rem] px-4 text-center sm:max-w-[18rem]")}>
        <div className="flex flex-col items-center justify-center gap-0.5 text-center">
          <span className="font-medium leading-snug text-gray-900 dark:text-gray-100">
            {service.name}
          </span>
          <span className="break-all text-xs text-gray-600 dark:text-gray-400">{service.identifier}</span>
          {(service.serverLocation || service.productType) && (
            <span className="text-xs text-muted-foreground">
              {service.productType === "vps" ? "VPS" : "Hosting"}
              {service.serverLocation ? ` · ${service.serverLocation}` : ""}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className={cn(cellBorder, "whitespace-nowrap px-4 text-center")}>
        <div className="flex flex-col items-center justify-center gap-0.5">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(service.pricing.amount, service.pricing.currency)}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {getBillingCycleName(service.pricing.billingCycle)}
          </span>
        </div>
      </TableCell>
      <TableCell className={cn(cellBorder, "px-4 text-center")}>
        {service.nextDueDate ? (
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {formatDate(service.nextDueDate, "full")}
          </span>
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-500">—</span>
        )}
      </TableCell>
      <TableCell className={cn(cellBorder, "px-4 text-center")}>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {isExpired && service.expiredDaysAgo !== undefined && (
            <span className="inline-flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Expired {service.expiredDaysAgo}d ago</span>
            </span>
          )}
          {isActive && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400"
              )}
            >
              <Check className="h-3 w-3 shrink-0" />
              Active
            </span>
          )}
          {service.status === "suspended" && (
            <span className="inline-flex items-center rounded-md border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400">
              Suspended
            </span>
          )}
          {service.status === "cancelled" && (
            <span className="inline-flex items-center rounded-md border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-900 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300">
              Cancelled
            </span>
          )}
          {(service.status === "pending" || service.status === "provisioning") && (
            <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400">
              {getPendingStatusLabel(service.status, service.pendingReason)}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="border-r-0 py-3 px-4 text-center align-middle">
        <div className="flex justify-center">
          <Button
            variant="default"
            size="sm"
            onClick={() => onManage(service.id)}
            className="h-8 whitespace-nowrap"
          >
            Manage
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
