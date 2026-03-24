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
  // Local state for search input (UI-only)
  const [searchValue, setSearchValue] = useState(filters.search || "");
  // Local state for filter dropdown (UI-only)
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
    <div className="mb-6 flex items-center gap-4">
      {/* Search Bar */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Filter Button */}
      <div className="relative">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={cn(
            "p-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900",
            isFilterOpen && "bg-gray-50 dark:bg-gray-800 border-gray-400 dark:border-gray-600"
          )}
        >
          <Filter className="w-5 h-5 text-primary" />
        </button>

        {/* Filter Dropdown */}
        {isFilterOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
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
        )}
      </div>
    </div>
  );
}
