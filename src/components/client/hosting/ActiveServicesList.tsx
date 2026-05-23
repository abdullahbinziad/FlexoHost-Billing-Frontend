"use client";

import { Filter, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { HostingService } from "@/types/hosting";
import { ServiceTableRow } from "./ServiceCard";
import { SERVICE_STATUS, normalizeServiceStatus, type ServiceStatusValue } from "@/constants/serviceStatus";

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
  const FILTER_ALL = "ALL" as const;
  type FilterValue = typeof FILTER_ALL | ServiceStatusValue;
  // Local state for filter dropdown (UI-only)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Local state for filter selection (UI-only)
  const [filterStatus, setFilterStatus] = useState<FilterValue>(FILTER_ALL);
  // Local state for search input (UI-only)
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredServices = useMemo(
    () =>
      services.filter((service) => {
        const normalized = normalizeServiceStatus(service.status, {
          suspendedAt: service.suspendedAt,
          terminatedAt: service.terminatedAt,
          cancelledAt: service.cancelledAt,
        });
        const matchesStatus =
          filterStatus === FILTER_ALL || normalized === filterStatus;
        const matchesSearch =
          !searchQuery ||
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.identifier.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
      }),
    [services, filterStatus, searchQuery]
  );

  const totalItems = filteredServices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);

  useEffect(() => {
    setPage(1);
  }, [filterStatus, searchQuery]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedServices = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredServices.slice(start, start + pageSize);
  }, [filteredServices, page, pageSize]);

  return (
    <>
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden w-full min-w-0 max-w-full">
      {/* Header with Search and Filter */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 sm:text-xl min-w-0">
            {title}
          </h2>
          <div className="flex min-w-0 w-full items-center gap-2 sm:w-auto sm:shrink-0">
            {/* Search Bar */}
            <div className="relative min-w-0 flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full min-w-0 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:w-48"
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
                  <div className="absolute right-0 left-auto top-full mt-2 w-[min(100vw-2rem,12rem)] sm:w-48 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFilterStatus(FILTER_ALL);
                          setIsFilterOpen(false);
                        }}
                        className={cn(
                          "w-full justify-start",
                          filterStatus === FILTER_ALL
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
                          setFilterStatus(SERVICE_STATUS.ACTIVE);
                          setIsFilterOpen(false);
                        }}
                        className={cn(
                          "w-full justify-start",
                          filterStatus === SERVICE_STATUS.ACTIVE
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
                          setFilterStatus(SERVICE_STATUS.EXPIRED);
                          setIsFilterOpen(false);
                        }}
                        className={cn(
                          "w-full justify-start",
                          filterStatus === SERVICE_STATUS.EXPIRED
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
                          setFilterStatus(SERVICE_STATUS.SUSPENDED);
                          setIsFilterOpen(false);
                        }}
                        className={cn(
                          "w-full justify-start",
                          filterStatus === SERVICE_STATUS.SUSPENDED
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

      </div>

      {/* Services table — real <table>; horizontal scroll on small viewports */}
      <div className="min-w-0 border-t border-gray-100 dark:border-gray-800/80">
        {filteredServices.length === 0 ? (
          <div className="p-10 text-center sm:p-12">
            <p className="text-gray-500 dark:text-gray-400">No services found</p>
          </div>
        ) : (
          <Table className="w-full min-w-[760px] border-collapse border border-gray-100 text-sm dark:border-gray-800/80 md:min-w-[880px]">
            <TableHeader>
              <TableRow className="border-b border-gray-100 bg-gray-50/90 hover:bg-gray-50/90 dark:border-gray-800/80 dark:bg-gray-900/50 dark:hover:bg-gray-900/50">
                <TableHead className="h-11 w-12 border-r border-gray-100 px-2 text-center align-middle text-xs font-semibold uppercase tracking-wide text-gray-600 dark:border-gray-800/80 dark:text-gray-400">
                  <span className="sr-only">Type</span>
                </TableHead>
                <TableHead className="h-11 border-r border-gray-100 px-4 text-center align-middle text-xs font-semibold uppercase tracking-wide text-gray-600 dark:border-gray-800/80 dark:text-gray-400">
                  Product / service
                </TableHead>
                <TableHead className="h-11 border-r border-gray-100 px-4 text-center align-middle text-xs font-semibold uppercase tracking-wide text-gray-600 dark:border-gray-800/80 dark:text-gray-400">
                  Pricing
                </TableHead>
                <TableHead className="h-11 border-r border-gray-100 px-4 text-center align-middle text-xs font-semibold uppercase tracking-wide text-gray-600 dark:border-gray-800/80 dark:text-gray-400">
                  Next due
                </TableHead>
                <TableHead className="h-11 border-r border-gray-100 px-4 text-center align-middle text-xs font-semibold uppercase tracking-wide text-gray-600 dark:border-gray-800/80 dark:text-gray-400">
                  Status
                </TableHead>
                <TableHead className="h-11 px-4 text-center align-middle text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr:nth-child(even)]:bg-gray-50/60 dark:[&_tr:nth-child(even)]:bg-gray-900/35 [&_tr]:border-gray-100 dark:[&_tr]:border-gray-800/80">
              {paginatedServices.map((service) => (
                <ServiceTableRow key={service.id} service={service} onManage={onManage} />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
    {totalItems > 0 && (
      <DataTablePagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        currentCount={paginatedServices.length}
        itemLabel="services"
        onPageChange={setPage}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
        variant="compact"
        showJumpToPage={false}
      />
    )}
    </>
  );
}
