"use client";

import { Check, AlertCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HostingServiceDetails } from "@/types/hosting-manage";
import { SERVICE_STATUS, normalizeServiceStatus } from "@/constants/serviceStatus";

interface ServiceHeaderProps {
  service: HostingServiceDetails;
}

export function ServiceHeader({ service }: ServiceHeaderProps) {
  const normalizedStatus = normalizeServiceStatus(service.status, {
    suspendedAt: service.suspendedAt,
    terminatedAt: service.terminatedAt,
    cancelledAt: service.cancelledAt,
  });
  const getStatusConfig = () => {
    switch (normalizedStatus) {
      case SERVICE_STATUS.ACTIVE:
        return {
          icon: Check,
          label: "Active",
          className: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
        };
      case SERVICE_STATUS.EXPIRED:
        return {
          icon: XCircle,
          label: "Expired",
          className: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
        };
      case SERVICE_STATUS.SUSPENDED:
        return {
          icon: AlertCircle,
          label: "Suspended",
          className: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
        };
      case SERVICE_STATUS.TERMINATED:
        return {
          icon: XCircle,
          label: "Terminated",
          className: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
        };
      case SERVICE_STATUS.CANCELLED:
        return {
          icon: XCircle,
          label: "Cancelled",
          className: "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
        };
      case SERVICE_STATUS.PROVISIONING:
        return {
          icon: Clock,
          label: "Provisioning",
          className: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        };
      case SERVICE_STATUS.PENDING:
        return {
          icon: Clock,
          label: "Pending",
          className: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        };
      default:
        return {
          icon: AlertCircle,
          label: "Unknown",
          className: "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {service.domain}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {service.packageName}
          </p>
          {service.serverLocation && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Server: {service.serverLocation}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium",
              statusConfig.className
            )}
          >
            <StatusIcon className="w-4 h-4" />
            <span>{statusConfig.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
