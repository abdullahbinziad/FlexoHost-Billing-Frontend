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
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Services Renewing Soon
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You have {data.count} service(s) that are available for renewal soon.
            Renew them today for peace of mind.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onRenew}
            className="bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white"
          >
            <RefreshCw className="w-4 h-4" />
            Renew Now
          </Button>
          <Button
            variant="outline"
            size="icon"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
