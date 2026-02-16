"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Domain, DomainTableFilters } from "@/types/domain";
import { DomainTableRow } from "./DomainTableRow";

interface DomainTableProps {
  domains: Domain[];
  selectedDomains: Set<string>;
  filters: DomainTableFilters;
  onSelectDomain: (domainId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onToggleAutoRenewal: (domainId: string, enabled: boolean) => void;
  onRenew: (domainId: string) => void;
  onManage: (domainId: string) => void;
  onSort: (sortBy: DomainTableFilters["sortBy"]) => void;
}

export function DomainTable({
  domains,
  selectedDomains,
  filters,
  onSelectDomain,
  onSelectAll,
  onToggleAutoRenewal,
  onRenew,
  onManage,
  onSort,
}: DomainTableProps) {
  const allSelected = domains.length > 0 && selectedDomains.size === domains.length;
  const someSelected = selectedDomains.size > 0 && selectedDomains.size < domains.length;

  const SortableHeader = ({
    label,
    sortKey,
  }: {
    label: string;
    sortKey: DomainTableFilters["sortBy"];
  }) => {
    const isActive = filters.sortBy === sortKey;
    return (
      <th className="px-4 py-3 text-left align-middle">
        <Button
          variant="ghost"
          type="button"
          onClick={() => onSort(sortKey)}
          className="h-auto p-1 -ml-1 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hover:text-gray-900 dark:hover:text-gray-200"
        >
          <span>{label}</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform",
              isActive && filters.sortOrder === "asc" && "rotate-180"
            )}
          />
        </Button>
      </th>
    );
  };

  if (domains.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No domains found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left align-middle">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 bg-white dark:bg-gray-900 cursor-pointer"
                  />
                </div>
              </th>
              <SortableHeader label="Domain name" sortKey="name" />
              <SortableHeader label="Status" sortKey="status" />
              <SortableHeader label="Expiration date" sortKey="expirationDate" />
              <SortableHeader label="Auto-renewal" sortKey="autoRenewal" />
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider align-middle">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {domains.map((domain) => (
              <DomainTableRow
                key={domain.id}
                domain={domain}
                isSelected={selectedDomains.has(domain.id)}
                onSelect={onSelectDomain}
                onToggleAutoRenewal={onToggleAutoRenewal}
                onRenew={onRenew}
                onManage={onManage}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
