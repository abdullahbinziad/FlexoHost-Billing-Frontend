"use client";

import { useState } from "react";
import { RefreshCw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DomainDetails } from "@/types/domain-manage";

interface AutoRenewTabProps {
  domain: DomainDetails;
  onAutoRenewalChange?: (enabled: boolean) => void;
}

export function AutoRenewTab({ domain, onAutoRenewalChange }: AutoRenewTabProps) {
  const [autoRenewal, setAutoRenewal] = useState(domain.autoRenewal);

  const handleToggle = (enabled: boolean) => {
    setAutoRenewal(enabled);
    onAutoRenewalChange?.(enabled);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Auto Renewal
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatically renew your domain before it expires to avoid service interruption.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoRenewal}
              onChange={(e) => handleToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {autoRenewal && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium">Auto-renewal is enabled</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              Your domain will be automatically renewed before the expiration date.
            </p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Renewal Information
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
            <span className="text-sm text-gray-600 dark:text-gray-400">Next Renewal Date</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {new Date(domain.billing.nextDueDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Renewal Amount</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {domain.billing.recurringAmount} BDT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
