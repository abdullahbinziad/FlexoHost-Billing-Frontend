"use client";

import { AlertCircle, Check, Lock } from "lucide-react";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { formatDate } from "@/utils/format";
import { getBillingCycleName } from "@/utils/checkout";
import { Button } from "@/components/ui/button";
import type { HostingService } from "@/types/hosting";

interface ServiceCardProps {
  service: HostingService;
  onManage: (serviceId: string) => void;
}

export function ServiceCard({ service, onManage }: ServiceCardProps) {
  const formatCurrency = useFormatCurrency();
  const isExpired = service.status === "expired";
  const isActive = service.status === "active";

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Icon Column */}
        <div className="col-span-1 flex items-center justify-center">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
            <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Product/Service Column */}
        <div className="col-span-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {service.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{service.identifier}</p>
        </div>

        {/* Pricing Column */}
        <div className="col-span-3">
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {formatCurrency(service.pricing.amount, service.pricing.currency)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getBillingCycleName(service.pricing.billingCycle)}
          </p>
        </div>

        {/* Next Due Date Column */}
        <div className="col-span-3">
          {service.nextDueDate ? (
            <p className="text-base font-medium text-gray-900 dark:text-gray-100">
              {formatDate(service.nextDueDate, "full")}
            </p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-500">N/A</p>
          )}
        </div>

        {/* Status Column */}
        <div className="col-span-1 flex items-center justify-end">
          <div className="flex items-center gap-2">
            {isExpired && service.expiredDaysAgo !== undefined && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>Expired {service.expiredDaysAgo} days ago</span>
              </div>
            )}
            {isActive && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded">
                <Check className="w-3 h-3" />
                Active
              </span>
            )}
            {service.status === "suspended" && (
              <span className="inline-flex items-center px-3 py-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-medium rounded">
                Suspended
              </span>
            )}
            {service.status === "pending" && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded">
                Pending
              </span>
            )}
          </div>
        </div>

        {/* Actions Column */}
        <div className="col-span-1 flex items-center justify-end">
          <Button
            variant="default"
            size="sm"
            onClick={() => onManage(service.id)}
            className="h-8 whitespace-nowrap"
          >
            Manage
          </Button>
        </div>
      </div>
    </div>
  );
}
