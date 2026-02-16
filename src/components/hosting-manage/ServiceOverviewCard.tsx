"use client";

import Link from "next/link";
import {
  Server,
  Globe,
  Calendar,
  CreditCard,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { formatDate } from "@/utils/format";
import type { HostingServiceDetails } from "@/types/hosting-manage";

interface ServiceOverviewCardProps {
  service: HostingServiceDetails;
}

export function ServiceOverviewCard({ service }: ServiceOverviewCardProps) {
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

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Domain Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Globe className="w-4 h-4" />
            <span>Domain</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`https://${service.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 font-semibold text-base flex items-center gap-2"
            >
              {service.domain}
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
          <a
            href={`https://${service.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-3 py-1.5 bg-green-600 dark:bg-green-700 text-white text-xs font-medium rounded hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
          >
            Visit Website
          </a>
        </div>

        {/* Package Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Server className="w-4 h-4" />
            <span>Package</span>
          </div>
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {service.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {service.packageName}
          </p>
        </div>

        {/* Server Location */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>Location</span>
          </div>
          <p className="text-base font-medium text-gray-900 dark:text-gray-100">
            {service.serverLocation || "N/A"}
          </p>
        </div>

        {/* Billing Cycle */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <CreditCard className="w-4 h-4" />
            <span>Billing Cycle</span>
          </div>
          <p className="text-base font-medium text-gray-900 dark:text-gray-100">
            {getBillingCycleLabel(service.pricing.billingCycle)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatCurrency(service.pricing.amount, service.pricing.currency)} per cycle
          </p>
        </div>

        {/* Next Due Date */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>Next Due Date</span>
          </div>
          <p className="text-base font-medium text-gray-900 dark:text-gray-100">
            {service.nextDueDate
              ? formatDate(service.nextDueDate, "full")
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
