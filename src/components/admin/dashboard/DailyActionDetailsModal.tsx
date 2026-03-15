"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { formatCurrency, formatDateTime } from "@/utils/format";
import type { DailyActionDetailsResponse } from "@/store/api/dashboardApi";

interface DailyActionDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  data?: DailyActionDetailsResponse;
}

export function DailyActionDetailsModal({
  open,
  onOpenChange,
  isLoading,
  data,
}: DailyActionDetailsModalProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const items = data?.items ?? [];
  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const paginatedItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  useEffect(() => {
    setPage(1);
  }, [open, data?.type]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{data?.title ?? "Daily Action Details"}</DialogTitle>
          <DialogDescription>
            Recent items for the selected date range. You can open each item from here.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length ? (
            <div className="space-y-3">
              {paginatedItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border bg-card p-4 text-card-foreground"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium break-words">{item.title}</p>
                      {item.subtitle ? (
                        <p className="text-sm text-muted-foreground break-words">
                          {item.subtitle}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {item.status ? (
                          <Badge variant="secondary" className="capitalize">
                            {item.status.replace(/_/g, " ")}
                          </Badge>
                        ) : null}
                        {typeof item.amount === "number" ? (
                          <span className="text-sm font-medium">
                            {formatCurrency(item.amount, item.currency)}
                          </span>
                        ) : null}
                        {item.date ? (
                          <span className="text-sm text-muted-foreground">
                            {formatDateTime(item.date)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {item.href ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={item.href}>
                          Open
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No matching items were found for this date range.
            </div>
          )}
        </div>
        {!isLoading && items.length > 0 ? (
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            totalItems={items.length}
            pageSize={pageSize}
            currentCount={paginatedItems.length}
            itemLabel="items"
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
            pageSizeOptions={[10, 20, 50]}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
