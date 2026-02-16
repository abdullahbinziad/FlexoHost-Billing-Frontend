"use client";

import { formatCurrency } from "@/utils/format";
import { formatDate } from "@/utils/format";
import type { HostingServiceDetails } from "@/types/hosting-manage";

interface BillingOverviewCardProps {
  service: HostingServiceDetails;
}

export function BillingOverviewCard({ service }: BillingOverviewCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Billing Overview
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
          <span className="text-sm text-gray-600 dark:text-gray-400">First Payment Amount</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatCurrency(service.billing.firstPaymentAmount, service.pricing.currency)}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
          <span className="text-sm text-gray-600 dark:text-gray-400">Recurring Amount</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatCurrency(service.billing.recurringAmount, service.pricing.currency)}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
          <span className="text-sm text-gray-600 dark:text-gray-400">Billing Cycle</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {service.billing.billingCycle}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
          <span className="text-sm text-gray-600 dark:text-gray-400">Payment Method</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {service.billing.paymentMethod}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
          <span className="text-sm text-gray-600 dark:text-gray-400">Registration Date</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatDate(service.billing.registrationDate, "full")}
          </span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Next Due Date</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatDate(service.billing.nextDueDate, "full")}
          </span>
        </div>
      </div>
    </div>
  );
}
