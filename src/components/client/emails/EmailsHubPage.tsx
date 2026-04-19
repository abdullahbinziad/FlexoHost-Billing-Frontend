"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Mail, Server, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientServicesPageFrame } from "@/components/client/hosting/ClientServicesPageFrame";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { useClientServicesPage } from "@/hooks/useClientServicesPage";
import { cn } from "@/lib/utils";
import type { HostingService } from "@/types/hosting";
import { SERVICE_STATUS, normalizeServiceStatus } from "@/constants/serviceStatus";

const DEFAULT_PAGE_SIZE = 10;

function statusLabel(status: HostingService["status"]) {
  const normalized = normalizeServiceStatus(status);
  switch (normalized) {
    case SERVICE_STATUS.ACTIVE:
      return "Active";
    case SERVICE_STATUS.SUSPENDED:
      return "Suspended";
    case SERVICE_STATUS.PENDING:
    case SERVICE_STATUS.PROVISIONING:
      return "Provisioning";
    case SERVICE_STATUS.EXPIRED:
      return "Expired";
    case SERVICE_STATUS.TERMINATED:
      return "Terminated";
    case SERVICE_STATUS.CANCELLED:
      return "Cancelled";
    default:
      return String(status || "");
  }
}

const cellBorder =
  "border-r border-gray-100 py-3 align-middle dark:border-gray-800/80";

/** Status cell styling aligned with hosting `ServiceTableRow` for a consistent client-area table. */
function EmailHostingStatusCell({ status }: { status: HostingService["status"] }) {
  const normalized = normalizeServiceStatus(status);
  if (normalized === SERVICE_STATUS.ACTIVE) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800",
          "dark:border-green-800 dark:bg-green-950/50 dark:text-green-400"
        )}
      >
        <Check className="h-3 w-3 shrink-0" />
        Active
      </span>
    );
  }
  if (normalized === SERVICE_STATUS.SUSPENDED) {
    return (
      <span className="inline-flex items-center rounded-md border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400">
        Suspended
      </span>
    );
  }
  if (normalized === SERVICE_STATUS.PENDING || normalized === SERVICE_STATUS.PROVISIONING) {
    return (
      <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400">
        {statusLabel(normalized.toLowerCase() as HostingService["status"])}
      </span>
    );
  }
  return (
    <span className="text-xs font-medium text-muted-foreground">{statusLabel(status)}</span>
  );
}

export function EmailsHubPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const { services, isLoading, isProfileLoading, noClient } = useClientServicesPage({
    type: "HOSTING",
    limit: 100,
  });

  const eligible = useMemo(
    () =>
      services.filter(
        (s) => {
          const normalized = normalizeServiceStatus(s.status, {
            suspendedAt: s.suspendedAt,
            terminatedAt: s.terminatedAt,
            cancelledAt: s.cancelledAt,
          });
          return (
            normalized === SERVICE_STATUS.ACTIVE ||
            normalized === SERVICE_STATUS.SUSPENDED ||
            normalized === SERVICE_STATUS.PENDING ||
            normalized === SERVICE_STATUS.PROVISIONING
          );
        }
      ),
    [services]
  );

  const totalItems = eligible.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedServices = useMemo(() => {
    const start = (page - 1) * pageSize;
    return eligible.slice(start, start + pageSize);
  }, [eligible, page, pageSize]);

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary shrink-0" />
            Email accounts
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Mailboxes are created on your hosting packages (cPanel). Open a hosting service to add addresses,
            passwords, and webmail.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button variant="outline" asChild>
            <Link href="/hosting">All hosting</Link>
          </Button>
          <Button asChild>
            <Link href="/checkout">
              <Plus className="h-4 w-4 mr-2" />
              Order hosting
            </Link>
          </Button>
        </div>
      </div>

      <ClientServicesPageFrame
        isLoading={isLoading}
        isProfileLoading={isProfileLoading}
        noClient={noClient}
        loadingMessage="Loading hosting services..."
      >
        {eligible.length === 0 ? (
          <Card className="border-gray-200 dark:border-gray-800 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">No hosting for email yet</CardTitle>
              <CardDescription>
                When you have an active hosting plan, it will appear here so you can jump straight to mailbox
                management.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/checkout">Order hosting</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/hosting">View hosting</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <h2 className="text-sm font-medium text-muted-foreground">Hosting with email</h2>
            <Card className="overflow-hidden border-gray-200 dark:border-gray-800">
              <CardContent className="p-0">
                {/* Small / medium: stacked rows (readable on narrow viewports) */}
                <ul className="divide-y divide-gray-200 dark:divide-gray-800 lg:hidden">
                  {paginatedServices.map((service) => {
                    const canManageEmail = normalizeServiceStatus(service.status) === SERVICE_STATUS.ACTIVE;
                    return (
                      <li key={service.id}>
                        <button
                          type="button"
                          onClick={() => router.push(`/hosting/${service.id}`)}
                          className={cn(
                            "w-full text-left bg-white dark:bg-gray-900",
                            "flex flex-col gap-3 p-4 transition-colors",
                            "sm:flex-row sm:items-center sm:gap-4",
                            "hover:bg-gray-50/90 dark:hover:bg-gray-800/50",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                          )}
                        >
                          <div className="flex gap-3 min-w-0 flex-1 items-start">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                              <Server className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="font-medium text-gray-900 dark:text-gray-100 break-words [overflow-wrap:anywhere]">
                                {service.name}
                              </div>
                              <div className="text-sm text-muted-foreground break-all sm:break-words">
                                {service.identifier}
                              </div>
                            </div>
                          </div>
                          <div
                            className={cn(
                              "flex w-full flex-wrap items-center justify-between gap-2",
                              "border-t border-gray-100 pt-3 dark:border-gray-800",
                              "sm:w-auto sm:justify-end sm:gap-3 sm:border-0 sm:pt-0 sm:shrink-0"
                            )}
                          >
                            <span
                              className={cn(
                                "text-xs font-medium px-2.5 py-1 rounded-full",
                                normalizeServiceStatus(service.status) === SERVICE_STATUS.ACTIVE
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {statusLabel(service.status)}
                            </span>
                            <span className="text-sm font-medium text-primary inline-flex items-center gap-1">
                              {canManageEmail ? "Manage mailboxes" : "View service"}
                              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Large screens: same table primitives as hosting ActiveServicesList */}
                <div className="hidden min-w-0 border-t border-gray-100 dark:border-gray-800/80 lg:block">
                  <Table className="w-full min-w-[720px] border-collapse border border-gray-100 text-sm dark:border-gray-800/80">
                    <TableHeader>
                      <TableRow className="border-b border-gray-100 bg-gray-50/90 hover:bg-gray-50/90 dark:border-gray-800/80 dark:bg-gray-900/50 dark:hover:bg-gray-900/50">
                        <TableHead className="h-11 w-12 border-r border-gray-100 px-2 text-center align-middle text-xs font-semibold uppercase tracking-wide text-gray-600 dark:border-gray-800/80 dark:text-gray-400">
                          <span className="sr-only">Type</span>
                        </TableHead>
                        <TableHead className="h-11 border-r border-gray-100 px-4 text-center align-middle text-xs font-semibold uppercase tracking-wide text-gray-600 dark:border-gray-800/80 dark:text-gray-400">
                          Hosting plan
                        </TableHead>
                        <TableHead className="h-11 border-r border-gray-100 px-4 text-center align-middle text-xs font-semibold uppercase tracking-wide text-gray-600 dark:border-gray-800/80 dark:text-gray-400">
                          Domain / identifier
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
                      {paginatedServices.map((service) => {
                        const canManageEmail = normalizeServiceStatus(service.status) === SERVICE_STATUS.ACTIVE;
                        return (
                          <TableRow
                            key={service.id}
                            className="border-b border-gray-100 hover:bg-gray-50/70 dark:border-gray-800/80 dark:hover:bg-gray-800/40"
                          >
                            <TableCell className={cn(cellBorder, "w-12 px-2 text-center")}>
                              <div className="flex justify-center">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                                  <Server className="h-4 w-4 text-primary" />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell
                              className={cn(
                                cellBorder,
                                "max-w-[16rem] px-4 text-center sm:max-w-[20rem]"
                              )}
                            >
                              <span className="font-medium leading-snug text-gray-900 dark:text-gray-100">
                                {service.name}
                              </span>
                            </TableCell>
                            <TableCell className={cn(cellBorder, "px-4 text-center")}>
                              <span className="break-all text-sm text-gray-600 dark:text-gray-400">
                                {service.identifier}
                              </span>
                            </TableCell>
                            <TableCell className={cn(cellBorder, "px-4 text-center")}>
                              <div className="flex flex-wrap items-center justify-center gap-2">
                                <EmailHostingStatusCell status={service.status} />
                              </div>
                            </TableCell>
                            <TableCell className="border-r-0 py-3 px-4 text-center align-middle">
                              <div className="flex justify-center">
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="h-8 gap-1 whitespace-nowrap"
                                  onClick={() => router.push(`/hosting/${service.id}`)}
                                >
                                  {canManageEmail ? "Manage mailboxes" : "View service"}
                                  <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            <DataTablePagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              currentCount={paginatedServices.length}
              itemLabel="hosting plans"
              onPageChange={setPage}
              onPageSizeChange={(value) => {
                setPageSize(value);
                setPage(1);
              }}
              variant="compact"
              showJumpToPage={false}
            />
          </div>
        )}
      </ClientServicesPageFrame>
    </div>
  );
}
