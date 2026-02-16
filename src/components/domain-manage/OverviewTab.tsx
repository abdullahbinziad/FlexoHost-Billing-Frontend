"use client";

import { formatCurrency } from "@/utils/format";
import { formatDate } from "@/utils/format";
import type { DomainDetails } from "@/types/domain-manage";

interface OverviewTabProps {
  domain: DomainDetails;
  onTabChange?: (tabId: string) => void;
}

export function OverviewTab({ domain, onTabChange }: OverviewTabProps) {
  const handleQuickAction = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  };
  return (
    <div className="space-y-4">
      {/* Domain Details and Payment Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Domain Details */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Domain Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">Domain</span>
              <a
                href={`https://${domain.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                {domain.name}
              </a>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">Registration Date</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatDate(domain.registrationDate, "full")}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">Next Due Date</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatDate(domain.billing.nextDueDate, "full")}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                {domain.status}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Payment Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">First Payment Amount</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(domain.billing.firstPaymentAmount, "BDT")}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">Recurring Amount</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(domain.billing.recurringAmount, "BDT")} {domain.billing.billingCycle}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Payment Method</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {domain.billing.paymentMethod}
              </span>
            </div>
          </div>
        </div>
      </div>

   
    </div>
  );
}
