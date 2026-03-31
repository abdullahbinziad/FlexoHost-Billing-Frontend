"use client";

import { RefreshCw, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServicesRenewingSoon } from "@/types/hosting";

interface ServicesRenewingSoonCardProps {
  data: ServicesRenewingSoon;
  onRenew: () => void;
}

export function ServicesRenewingSoonCard({
  data,
  onRenew,
}: ServicesRenewingSoonCardProps) {
  if (data.count === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 sm:text-lg mb-2">
            Services Renewing Soon
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You have {data.count} service(s) that are available for renewal soon.
            Renew them today for peace of mind.
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2 sm:justify-end">
          <Button
            onClick={onRenew}
            className="min-w-0 flex-1 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white sm:flex-initial"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            Renew Now
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            aria-label="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
