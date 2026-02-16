"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DomainRegistrantInfoProps {
  useDefault: boolean;
  onUseDefaultChange: (useDefault: boolean) => void;
  onCustomRegistrantChange?: () => void;
}

export function DomainRegistrantInfo({
  useDefault,
  onUseDefaultChange,
  onCustomRegistrantChange,
}: DomainRegistrantInfoProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Domain Registrant Information
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        You may specify alternative registered contact details for the domain
        registration(s) in your order when placing an order on behalf of another
        person or entity. If you do not require this, you can skip this section.
      </p>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={useDefault}
            onChange={(e) => onUseDefaultChange(e.target.checked)}
            className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary bg-white dark:bg-gray-900"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Use Default Contact (Details Above)
          </span>
        </label>
      </div>
      {!useDefault && onCustomRegistrantChange && (
        <Button
          variant="link"
          size="sm"
          onClick={onCustomRegistrantChange}
        >
          Enter Custom Registrant Details
        </Button>
      )}
    </div>
  );
}
