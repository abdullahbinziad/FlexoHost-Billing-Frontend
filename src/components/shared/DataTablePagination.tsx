"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function getVisiblePages(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages]);

  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  } else if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  } else {
    pages.add(currentPage - 1);
    pages.add(currentPage);
    pages.add(currentPage + 1);
  }

  const sortedPages = Array.from(pages)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const visiblePages: Array<number | "ellipsis"> = [];

  sortedPages.forEach((p, index) => {
    if (index > 0 && p - sortedPages[index - 1] > 1) {
      visiblePages.push("ellipsis");
    }
    visiblePages.push(p);
  });

  return visiblePages;
}

interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  currentCount?: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  /** Compact layout for tight spaces */
  variant?: "default" | "compact";
  /** Show jump-to-page input when many pages */
  showJumpToPage?: boolean;
}

export function DataTablePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  currentCount,
  itemLabel = "records",
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className,
  variant = "default",
  showJumpToPage = true,
}: DataTablePaginationProps) {
  const [jumpValue, setJumpValue] = useState("");
  const safeTotalPages = Math.max(totalPages, 1);
  const safePage = Math.min(Math.max(page, 1), safeTotalPages);
  const visiblePages = getVisiblePages(safePage, safeTotalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end =
    totalItems === 0
      ? 0
      : Math.min(
          start + Math.max((currentCount ?? pageSize) - 1, 0),
          totalItems
        );

  const handleJumpToPage = () => {
    const num = parseInt(jumpValue, 10);
    if (!isNaN(num) && num >= 1 && num <= safeTotalPages) {
      onPageChange(num);
      setJumpValue("");
    }
  };

  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-4 rounded-xl border bg-card text-sm shadow-sm",
        "dark:border-gray-800 dark:bg-gray-900/50",
        isCompact ? "p-3 gap-3" : "p-4 sm:gap-4 md:gap-6",
        className
      )}
    >
      {/* Info row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="font-medium text-foreground">
            {totalItems > 0
              ? `Showing ${start}–${end} of ${totalItems} ${itemLabel}`
              : `No ${itemLabel}`}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {totalItems > 0 && (
              <span>Page {safePage} of {safeTotalPages}</span>
            )}
            {onPageSizeChange && (
              <label className="flex items-center gap-2">
                <span>Rows per page</span>
                <select
                  className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                  {pageSizeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>

        {/* Navigation: show whenever there are items so layout matches multi-page views (controls disabled on a single page). */}
        {totalItems > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-0.5 rounded-lg border border-input bg-muted/30 p-0.5 dark:border-gray-700">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-md"
                disabled={safePage <= 1}
                onClick={() => onPageChange(1)}
                aria-label="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-md"
                disabled={safePage <= 1}
                onClick={() => onPageChange(Math.max(1, safePage - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto px-1">
                {visiblePages.map((entry, idx) =>
                  entry === "ellipsis" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1.5 py-1 text-muted-foreground"
                    >
                      …
                    </span>
                  ) : (
                    <Button
                      key={entry}
                      variant={entry === safePage ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-8 min-w-8 shrink-0 px-2 font-medium",
                        entry === safePage && "shadow-sm"
                      )}
                      onClick={() => onPageChange(entry)}
                      aria-label={`Page ${entry}`}
                      aria-current={entry === safePage ? "page" : undefined}
                    >
                      {entry}
                    </Button>
                  )
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-md"
                disabled={safePage >= safeTotalPages}
                onClick={() => onPageChange(Math.min(safeTotalPages, safePage + 1))}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-md"
                disabled={safePage >= safeTotalPages}
                onClick={() => onPageChange(safeTotalPages)}
                aria-label="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>

            {showJumpToPage && safeTotalPages > 5 && !isCompact && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Go to</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={safeTotalPages}
                    value={jumpValue}
                    onChange={(e) => setJumpValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleJumpToPage()}
                    placeholder={String(safePage)}
                    className="h-8 w-16 rounded-md border border-input bg-background px-2 text-center text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    onClick={handleJumpToPage}
                  >
                    Go
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
