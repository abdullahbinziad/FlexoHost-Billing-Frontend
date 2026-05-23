"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveClient } from "@/hooks/useActiveClient";
import { useGetDomainsQuery, useUpdateDomainMutation } from "@/store/api/domainApi";
import { DomainPortfolioHeader } from "./DomainPortfolioHeader";
import { PromotionalBanner } from "@/components/shared/PromotionalBanner";
import { DomainSearchAndFilter } from "./DomainSearchAndFilter";
import { DomainTable } from "./DomainTable";
import type { Domain, DomainTableFilters } from "@/types/domain";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { toast } from "sonner";

export function DomainPortfolioPage() {
  const router = useRouter();
  const { activeClientId, isProfileLoading } = useActiveClient();
  const { data, isLoading, error } = useGetDomainsQuery(undefined, { skip: !activeClientId });
  const [updateDomain] = useUpdateDomainMutation();

  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<DomainTableFilters>({
    search: "",
    sortBy: "name",
    sortOrder: "asc",
  });

  const [domainsState, setDomainsState] = useState<Domain[]>([]);
  useEffect(() => {
    if (data?.domains) setDomainsState(data.domains);
  }, [data?.domains]);

  // Filter and sort domains
  const filteredDomains = useMemo(() => {
    let result = [...domainsState];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((domain) =>
        domain.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((domain) => domain.status === filters.status);
    }

    // Apply sorting
    if (filters.sortBy) {
      result.sort((a, b) => {
        let aValue: any = a[filters.sortBy!];
        let bValue: any = b[filters.sortBy!];

        if (filters.sortBy === "expirationDate") {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (aValue < bValue) return filters.sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return filters.sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [domainsState, filters]);
  const paginatedDomains = filteredDomains.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredDomains.length / pageSize) || 1;

  // Handlers
  const handleSelectDomain = (domainId: string, selected: boolean) => {
    setSelectedDomains((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(domainId);
      } else {
        newSet.delete(domainId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedDomains(new Set(paginatedDomains.map((d) => d.id)));
    } else {
      setSelectedDomains(new Set());
    }
  };

  const handleToggleAutoRenewal = async (domainId: string, enabled: boolean) => {
    setDomainsState((prev) =>
      prev.map((d) => (d.id === domainId ? { ...d, autoRenewal: enabled } : d))
    );
    try {
      await updateDomain({ domainId, autoRenewal: enabled }).unwrap();
    } catch {
      setDomainsState((prev) =>
        prev.map((d) => (d.id === domainId ? { ...d, autoRenewal: !enabled } : d))
      );
    }
  };

  const handleRenew = (domainId: string) => {
    const domain = domainsState.find((d) => d.id === domainId);
    if (domain?.name) router.push(`/domains/register?renew=${encodeURIComponent(domain.name)}`);
    else alert("Domain not found");
  };

  const handleManage = (domain: Domain) => {
    const target = (domain.name || domain.domainName || "").trim();
    if (!target) {
      toast.error("Domain name is not available. Try refreshing the page or contact support.");
      return;
    }
    router.push(`/domains/${encodeURIComponent(target)}`);
  };

  const handleAddDomain = () => {
    // Navigate to add domain page
    window.location.href = "/domains/register";
  };

  if (isProfileLoading || (activeClientId && isLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[240px] sm:min-h-[400px] px-4">
        <p className="text-center text-gray-500 dark:text-gray-400">Loading domains...</p>
      </div>
    );
  }

  if (!activeClientId) {
    return (
      <div className="flex items-center justify-center min-h-[240px] sm:min-h-[400px] px-4">
        <p className="text-center text-gray-500 dark:text-gray-400 max-w-md">
          Client profile not found. Please complete your profile.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mx-0 w-full min-w-0 max-w-full">
        <p className="text-red-800 dark:text-red-200 text-sm sm:text-base">Error loading domains. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full space-y-4 sm:space-y-6">
      <DomainPortfolioHeader onAddDomain={handleAddDomain} />
      {/* <PromotionalBanner
        title="New Year's sale is on – make your next move!"
        description="Grab these great deals that we've handpicked just for you."
      /> */}
      <DomainSearchAndFilter
        filters={filters}
        onFiltersChange={(nextFilters) => {
          setFilters(nextFilters);
          setPage(1);
        }}
      />
      <DomainTable
        domains={paginatedDomains}
        selectedDomains={selectedDomains}
        filters={filters}
        onSelectDomain={handleSelectDomain}
        onSelectAll={handleSelectAll}
        onToggleAutoRenewal={handleToggleAutoRenewal}
        onRenew={handleRenew}
        onManage={handleManage}
        onSort={(sortBy) =>
          setFilters((prev) => ({
            ...prev,
            sortBy,
            sortOrder:
              prev.sortBy === sortBy && prev.sortOrder === "asc" ? "desc" : "asc",
          }))
        }
      />
      <DataTablePagination
        page={page}
        totalPages={totalPages}
        totalItems={filteredDomains.length}
        pageSize={pageSize}
        currentCount={paginatedDomains.length}
        itemLabel="domains"
        onPageChange={setPage}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
      />
    </div>
  );
}
