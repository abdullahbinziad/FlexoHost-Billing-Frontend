"use client";

import { Check, AlertCircle, Clock, XCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DomainDetails } from "@/types/domain-manage";

interface DomainHeaderProps {
  domain: DomainDetails;
}

export function DomainHeader({ domain }: DomainHeaderProps) {
  const getStatusConfig = () => {
    switch (domain.status) {
      case "active":
        return {
          icon: Check,
          label: "Active",
          className: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
        };
      case "expired":
        return {
          icon: XCircle,
          label: "Expired",
          className: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
        };
      case "pending":
        return {
          icon: Clock,
          label: "Pending",
          className: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
        };
      case "suspended":
        return {
          icon: AlertCircle,
          label: "Suspended",
          className: "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
        };
      default:
        return {
          icon: AlertCircle,
          label: "Unknown",
          className: "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
        };
    }
  };

  const getSSLStatusConfig = () => {
    switch (domain.sslStatus) {
      case "active":
        return {
          icon: Lock,
          label: "SSL Active",
          className: "text-green-600 dark:text-green-400",
        };
      case "inactive":
        return {
          icon: Lock,
          label: "No SSL Detected",
          className: "text-red-600 dark:text-red-400",
        };
      case "expired":
        return {
          icon: Lock,
          label: "SSL Expired",
          className: "text-yellow-600 dark:text-yellow-400",
        };
      default:
        return {
          icon: Lock,
          label: "Unknown",
          className: "text-gray-600 dark:text-gray-400",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const sslConfig = getSSLStatusConfig();
  const StatusIcon = statusConfig.icon;
  const SSLIcon = sslConfig.icon;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            Managing {domain.name}
          </h1>
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
          <div className={cn("inline-flex items-center gap-2 text-sm font-medium", sslConfig.className)}>
            <SSLIcon className="w-4 h-4" />
            <span>{sslConfig.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
