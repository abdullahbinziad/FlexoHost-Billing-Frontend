"use client";

import { Server, Globe, Calendar, CreditCard, MapPin } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { formatDate } from "@/utils/format";
import type { HostingServiceDetails } from "@/types/hosting-manage";

interface ServiceInfoCardProps {
  service: HostingServiceDetails;
}

export function ServiceInfoCard({ service }: ServiceInfoCardProps) {
  const getBillingCycleLabel = (cycle: string) => {
    const labels: Record<string, string> = {
      monthly: "Monthly",
      quarterly: "Quarterly",
      "semi-annually": "Semi-Annually",
      annually: "Annually",
      biennially: "Biennially",
      triennially: "Triennially",
    };
    return labels[cycle] || cycle;
  };

  const infoItems = [
    {
      icon: Globe,
      label: "Domain",
      value: service.domain,
    },
    {
      icon: Server,
      label: "Package",
      value: service.name,
    },
    {
      icon: MapPin,
      label: "Server Location",
      value: service.serverLocation || "N/A",
    },
    {
      icon: CreditCard,
      label: "Billing Cycle",
      value: getBillingCycleLabel(service.pricing.billingCycle),
    },
    {
      icon: Calendar,
      label: "Next Due Date",
      value: service.nextDueDate
        ? formatDate(service.nextDueDate, "full")
        : "N/A",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Service Information
      </h3>
      <div className="space-y-4">
        {infoItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex items-start gap-2 pb-4 border-b border-gray-200 dark:border-gray-800 last:border-b-0 last:pb-0"
            >
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {item.label}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
