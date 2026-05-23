"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DomainTableFilters } from "@/types/domain";

interface DomainSearchAndFilterProps {
  filters: DomainTableFilters;
  onFiltersChange: (filters: DomainTableFilters) => void;
}

export function DomainSearchAndFilter({
  filters,
  onFiltersChange,
}: DomainSearchAndFilterProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onFiltersChange({ ...filters, search: value });
  };

  const handleSortChange = (sortBy: DomainTableFilters["sortBy"]) => {
    const newOrder =
      filters.sortBy === sortBy && filters.sortOrder === "asc"
        ? "desc"
        : "asc";
    onFiltersChange({
      ...filters,
      sortBy,
      sortOrder: newOrder,
    });
  };

  return (
    <div className="mb-4 flex min-w-0 items-center gap-2 sm:mb-6 sm:gap-3">
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          aria-hidden
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search..."
          className="h-11 w-full min-w-0 rounded-lg border border-gray-300 bg-white py-0 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
        />
      </div>

      <div className="relative shrink-0">
        <button
          type="button"
          aria-expanded={isFilterOpen}
          aria-haspopup="true"
          aria-label="Sort and filter options"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800",
            isFilterOpen &&
              "border-gray-400 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
          )}
        >
          <Filter
            className="h-5 w-5 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
            aria-hidden
          />
        </button>

        {isFilterOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              aria-hidden
              onClick={() => setIsFilterOpen(false)}
            />
            <div className="absolute right-0 top-full z-20 mt-2 w-[min(100vw-2rem,12rem)] max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 sm:w-48">
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleSortChange("name");
                    setIsFilterOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  Sort by Name
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleSortChange("status");
                    setIsFilterOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  Sort by Status
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleSortChange("expirationDate");
                    setIsFilterOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  Sort by Expiration
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
