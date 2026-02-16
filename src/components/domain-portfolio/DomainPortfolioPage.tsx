"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
// import { useGetDomainsQuery, useUpdateDomainMutation } from "@/store/api/domainApi";
import { DomainPortfolioHeader } from "./DomainPortfolioHeader";
import { PromotionalBanner } from "@/components/shared/PromotionalBanner";
import { DomainProtectionCard } from "./DomainProtectionCard";
import { DomainSearchAndFilter } from "./DomainSearchAndFilter";
import { DomainTable } from "./DomainTable";
import type { Domain, DomainTableFilters, DomainProtectionOffer } from "@/types/domain";
import { mockDomains, mockProtectionOffer } from "@/data/mockDomains";

export function DomainPortfolioPage() {
  const router = useRouter();

  // TODO: Replace with Redux/RTK Query when backend is ready
  // const { data, isLoading, error } = useGetDomainsQuery();
  // const [updateDomain] = useUpdateDomainMutation();

  // Static data for frontend development
  const domains = mockDomains;
  const isLoading = false;
  const error = null;

  // Local state: UI-only interactions
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<DomainTableFilters>({
    search: "",
    sortBy: "name",
    sortOrder: "asc",
  });

  // Local state for auto-renewal updates (simulating API call)
  const [domainsState, setDomainsState] = useState<Domain[]>(domains);

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
      setSelectedDomains(new Set(filteredDomains.map((d) => d.id)));
    } else {
      setSelectedDomains(new Set());
    }
  };

  const handleToggleAutoRenewal = async (domainId: string, enabled: boolean) => {
    // TODO: Replace with actual API call
    // try {
    //   await updateDomain({ domainId, autoRenewal: enabled }).unwrap();
    // } catch (error) {
    //   console.error("Failed to update auto-renewal:", error);
    // }

    // Static update for frontend
    setDomainsState((prev) =>
      prev.map((domain) =>
        domain.id === domainId ? { ...domain, autoRenewal: enabled } : domain
      )
    );
  };

  const handleRenew = (domainId: string) => {
    // TODO: Open renew modal or navigate to renew page
    console.log("Renew domain:", domainId);
    alert(`Renew domain: ${domainsState.find((d) => d.id === domainId)?.name}`);
  };

  const handleManage = (domainId: string) => {
    // Navigate to domain management page
    router.push(`/domains/${domainId}`);
  };

  const handleAddDomain = () => {
    // Navigate to add domain page
    window.location.href = "/domains/register";
  };

  const handleGetProtection = () => {
    // TODO: Open protection purchase modal
    console.log("Get protection for:", mockProtectionOffer.domain);
    alert(`Get protection for: ${mockProtectionOffer.domain}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading domains...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error loading domains. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DomainPortfolioHeader onAddDomain={handleAddDomain} />
      <PromotionalBanner
        title="New Year's sale is on – make your next move!"
        description="Grab these great deals that we've handpicked just for you."
      />
      <DomainProtectionCard
        offer={mockProtectionOffer}
        onGetNow={handleGetProtection}
      />
      <DomainSearchAndFilter filters={filters} onFiltersChange={setFilters} />
      <DomainTable
        domains={filteredDomains}
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
    </div>
  );
}
