"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Domain } from "@/types/domain";
import { formatDate } from "@/utils/format";
import { DOMAIN_STATUS } from "@/constants/status";

export interface DomainTableRowProps {
  domain: Domain;
  isSelected: boolean;
  onSelect: (domainId: string, selected: boolean) => void;
  onToggleAutoRenewal: (domainId: string, enabled: boolean) => void;
  onRenew: (domainId: string) => void;
  onManage: (domainId: string) => void;
}

const DOMAIN_STATUS_COLORS: Record<Domain["status"], string> = {
  active: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30",
  expired: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30",
  pending: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30",
  suspended: "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50",
};

export function domainStatusBadgeClassName(status: Domain["status"]) {
  return cn(
    "inline-flex items-center gap-2 px-2 py-1 rounded text-sm font-medium",
    DOMAIN_STATUS_COLORS[status]
  );
}

export function DomainTableRow({
  domain,
  isSelected,
  onSelect,
  onToggleAutoRenewal,
  onRenew,
  onManage,
}: DomainTableRowProps) {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      {/* Checkbox */}
      <td className="px-4 py-4 align-middle">
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(domain.id, e.target.checked)}
            className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 bg-white dark:bg-gray-900 cursor-pointer"
          />
        </div>
      </td>

      {/* Domain Name */}
      <td className="px-4 py-4 align-middle">
        <span className="font-medium text-gray-900 dark:text-gray-100 break-all">{domain.name}</span>
      </td>

      {/* Status */}
      <td className="px-4 py-4 align-middle">
        <span className={domainStatusBadgeClassName(domain.status)}>
          {domain.status === DOMAIN_STATUS.ACTIVE && <Check className="w-4 h-4 shrink-0" />}
          <span className="capitalize">{domain.status}</span>
        </span>
      </td>

      {/* Expiration Date */}
      <td className="px-4 py-4 align-middle text-gray-700 dark:text-gray-300">
        {formatDate(domain.expirationDate, "short")}
      </td>

      {/* Auto-renewal */}
      <td className="px-4 py-4 align-middle">
        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={domain.autoRenewal}
              onChange={(e) => onToggleAutoRenewal(domain.id, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-4 align-middle">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRenew(domain.id)}
            className="h-8"
          >
            Renew
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => onManage(domain.name)}
            className="h-8"
          >
            Manage
          </Button>
        </div>
      </td>
    </tr>
  );
}
