"use client";

import { RefreshCw, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { formatDate } from "@/utils/format";
import type { DomainDetails } from "@/types/domain-manage";

interface RenewTabProps {
  domain: DomainDetails;
  onRenew?: () => void;
  isRenewing?: boolean;
}

export function RenewTab({ domain, onRenew, isRenewing }: RenewTabProps) {
  const formatCurrency = useFormatCurrency();
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Renew Domain
        </h3>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Domain</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {domain.name}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Expiration Date</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatDate(domain.expirationDate, "full")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Renewal Amount</span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(domain.billing.recurringAmount, domain.billing?.currency)}
              </span>
            </div>
          </div>

          <Button
            onClick={onRenew}
            className="w-full"
            size="lg"
            disabled={isRenewing}
          >
            <RefreshCw className="w-5 h-5" />
            {isRenewing ? "Renewing..." : "Renew Domain Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
