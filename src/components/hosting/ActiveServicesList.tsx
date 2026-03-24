"use client";

import { Filter, ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { HostingService } from "@/types/hosting";
import { ServiceCard } from "./ServiceCard";

interface ActiveServicesListProps {
  services: HostingService[];
  onManage: (serviceId: string) => void;
  /** Optional section title (e.g. "Hosting", "VPS"). Default: "Your Active Hosting Services". */
  title?: string;
}

export function ActiveServicesList({
  services,
  onManage,
  title = "Your Active Hosting Services",
}: ActiveServicesListProps) {
  // Local state for filter dropdown (UI-only)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Local state for filter selection (UI-only)
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "expired" | "suspended"
  >("all");
  // Local state for search input (UI-only)
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = services.filter((service) => {
    const matchesStatus =
      filterStatus === "all" || service.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.identifier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      {/* Header with Search and Filter */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-48"
              />
            </div>
            {/* Filter Button */}
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn(
                  isFilterOpen && "bg-gray-50 dark:bg-gray-800 border-gray-400 dark:border-gray-600"
                )}
              >
                <Filter className="w-5 h-5" />
              </Button>

              {/* Filter Dropdown */}
              {isFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFilterStatus("all");
                          setIsFilterOpen(false);
                        }}
                        className={cn(
                          "w-full justify-start",
                          filterStatus === "all"
                            ? "bg-primary/10 dark:bg-primary/20 text-primary font-medium"
                            : ""
                        )}
                      >
                        All Services
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFilterStatus("active");
                          setIsFilterOpen(false);
                        }}
                        className={cn(
                          "w-full justify-start",
                          filterStatus === "active"
                            ? "bg-primary/10 dark:bg-primary/20 text-primary font-medium"
                            : ""
                        )}
                      >
                        Active
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFilterStatus("expired");
                          setIsFilterOpen(false);
                        }}
                        className={cn(
                          "w-full justify-start",
                          filterStatus === "expired"
                            ? "bg-primary/10 dark:bg-primary/20 text-primary font-medium"
                            : ""
                        )}
                      >
                        Expired
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFilterStatus("suspended");
                          setIsFilterOpen(false);
                        }}
                        className={cn(
                          "w-full justify-start",
                          filterStatus === "suspended"
                            ? "bg-primary/10 dark:bg-primary/20 text-primary font-medium"
                            : ""
                        )}
                      >
                        Suspended
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="col-span-1"></div>
          <div className="col-span-3 flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Product/Service
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="col-span-3 flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Pricing
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="col-span-3 flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Next Due Date
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="col-span-1 flex items-center justify-end gap-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Status
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="col-span-1 flex items-center justify-end gap-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </span>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div>
        {filteredServices.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No services found</p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onManage={onManage}
            />
          ))
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
          <select className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary">
            <option>10</option>
            <option>25</option>
            <option>50</option>
            <option>100</option>
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing 1 to {filteredServices.length} of {filteredServices.length} entries
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">
              Previous
            </Button>
            <Button variant="default" size="sm">
              1
            </Button>
            <Button variant="ghost" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
