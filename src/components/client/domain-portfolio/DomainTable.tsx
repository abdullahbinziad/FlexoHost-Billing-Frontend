"use client";

import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Domain, DomainTableFilters } from "@/types/domain";
import { formatDate } from "@/utils/format";
import { DOMAIN_STATUS } from "@/constants/status";
import {
  DomainTableRow,
  domainStatusBadgeClassName,
  type DomainTableRowProps,
} from "./DomainTableRow";

function DomainPortfolioMobileCard({
  domain,
  isSelected,
  onSelect,
  onToggleAutoRenewal,
  onRenew,
  onManage,
}: DomainTableRowProps) {
  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex gap-3">
        <div className="flex shrink-0 items-start pt-0.5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(domain.id, e.target.checked)}
            className="mt-0.5 h-4 w-4 cursor-pointer rounded border-gray-300 bg-white text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-900 dark:focus:ring-offset-gray-900"
            aria-label={`Select ${domain.name}`}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Domain
            </p>
            <p className="break-all font-medium text-gray-900 dark:text-gray-100">{domain.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={domainStatusBadgeClassName(domain.status)}>
              {domain.status === DOMAIN_STATUS.ACTIVE && <Check className="h-4 w-4 shrink-0" />}
              <span className="capitalize">{domain.status}</span>
            </span>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Expires
            </p>
            <p className="text-gray-700 dark:text-gray-300">{formatDate(domain.expirationDate, "short")}</p>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/40">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-renewal</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={domain.autoRenewal}
                onChange={(e) => onToggleAutoRenewal(domain.id, e.target.checked)}
                className="peer sr-only"
              />
              <div className="relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary dark:bg-gray-700 dark:after:border-gray-600" />
            </label>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRenew(domain.id)}
              className="h-9 w-full sm:h-8 sm:flex-1"
            >
              Renew
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onManage(domain)}
              className="h-9 w-full sm:h-8 sm:flex-1"
            >
              Manage
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DomainTableProps {
  domains: Domain[];
  selectedDomains: Set<string>;
  filters: DomainTableFilters;
  onSelectDomain: (domainId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onToggleAutoRenewal: (domainId: string, enabled: boolean) => void;
  onRenew: (domainId: string) => void;
  onManage: (domain: Domain) => void;
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
      <div className="px-4 py-10 text-center sm:py-12">
        <p className="text-gray-500 dark:text-gray-400">No domains found</p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="lg:hidden">
        <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(input) => {
              if (input) input.indeterminate = someSelected;
            }}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-gray-300 bg-white text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-900 dark:focus:ring-offset-gray-900"
            aria-label="Select all domains on this page"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">Select all on this page</span>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {domains.map((domain) => (
            <DomainPortfolioMobileCard
              key={domain.id}
              domain={domain}
              isSelected={selectedDomains.has(domain.id)}
              onSelect={onSelectDomain}
              onToggleAutoRenewal={onToggleAutoRenewal}
              onRenew={onRenew}
              onManage={onManage}
            />
          ))}
        </div>
      </div>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[720px]">
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
