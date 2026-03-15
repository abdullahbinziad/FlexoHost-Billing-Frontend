"use client";

import { Button } from "@/components/ui/button";

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
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const visiblePages: Array<number | "ellipsis"> = [];

  sortedPages.forEach((page, index) => {
    if (index > 0 && page - sortedPages[index - 1] > 1) {
      visiblePages.push("ellipsis");
    }
    visiblePages.push(page);
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
  pageSizeOptions = [10, 20, 50],
  className,
}: DataTablePaginationProps) {
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

  return (
    <div
      className={[
        "flex w-full min-w-0 flex-col gap-3 rounded-lg border border-dashed bg-white p-3 text-sm text-muted-foreground dark:bg-gray-900",
        "lg:flex-row lg:items-center lg:justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="min-w-0 break-words font-medium">
        {totalItems > 0
          ? `Showing ${start} to ${end} of ${totalItems} ${itemLabel}`
          : `0 ${itemLabel}`}
      </span>

      <div className="flex min-w-0 flex-col gap-3 lg:items-end">
        {onPageSizeChange ? (
          <label className="flex flex-wrap items-center gap-2 whitespace-nowrap">
            <span>Per page:</span>
            <select
              className="h-8 rounded border border-gray-200 bg-white px-2 text-xs font-medium dark:border-gray-800 dark:bg-gray-900"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {safeTotalPages > 1 ? (
          <div className="flex min-w-0 flex-col gap-2 lg:items-end">
            <div className="flex min-w-0 items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                disabled={safePage <= 1}
                onClick={() => onPageChange(Math.max(1, safePage - 1))}
              >
                Prev
              </Button>
              <div className="min-w-0 max-w-full overflow-x-auto">
                <div className="flex min-w-max items-center gap-1 pr-1">
                  {visiblePages.map((entry, index) =>
                    entry === "ellipsis" ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-1.5 text-xs text-muted-foreground"
                      >
                        ...
                      </span>
                    ) : (
                      <Button
                        key={entry}
                        variant={entry === safePage ? "default" : "outline"}
                        size="sm"
                        className="min-w-8 shrink-0 px-2"
                        onClick={() => onPageChange(entry)}
                      >
                        {entry}
                      </Button>
                    )
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                disabled={safePage >= safeTotalPages}
                onClick={() => onPageChange(Math.min(safeTotalPages, safePage + 1))}
              >
                Next
              </Button>
            </div>
            <span className="text-xs text-muted-foreground lg:text-right">
              Page {safePage} of {safeTotalPages}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
