"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useActiveClient } from "@/hooks/useActiveClient";
import { useGetTicketsQuery } from "@/store/api/ticketApi";
import { formatDate } from "@/utils/format";
import { TicketStatusBadge, TICKET_STATUS_LABELS } from "@/components/shared/ticket/TicketStatusBadge";
import { TicketPriorityBadge } from "@/components/shared/ticket/TicketPriorityBadge";
import { cn } from "@/lib/utils";

const CLIENT_STATUS_LABELS: Record<string, string> = {
  ...TICKET_STATUS_LABELS,
  answered: "Answered (waiting on you)",
  customer_reply: "Your reply sent",
};

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "open", label: CLIENT_STATUS_LABELS.open },
  { value: "answered", label: CLIENT_STATUS_LABELS.answered },
  { value: "customer_reply", label: CLIENT_STATUS_LABELS.customer_reply },
  { value: "on_hold", label: CLIENT_STATUS_LABELS.on_hold },
  { value: "in_progress", label: CLIENT_STATUS_LABELS.in_progress },
  { value: "closed", label: CLIENT_STATUS_LABELS.closed },
  { value: "resolved", label: CLIENT_STATUS_LABELS.resolved },
];

export default function ClientTickets() {
  const router = useRouter();
  const { activeClientId } = useActiveClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, error } = useGetTicketsQuery({
    page,
    limit: pageSize,
    ...(activeClientId ? { clientId: activeClientId } : {}),
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const tickets = data?.results ?? [];
  const totalResults = data?.totalResults ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Support Tickets
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage your support requests.
          </p>
        </div>
        <Link href="/tickets/new" className="shrink-0">
          <Button size="lg" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Open New Ticket
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border bg-muted/20 p-4">
        <div className="max-w-xs">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Status
          </label>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop: Table */}
      <div className="hidden rounded-xl border bg-card shadow-sm sm:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[120px]">Ticket #</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Loading tickets...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center text-destructive">
                  Failed to load tickets.
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 opacity-40" />
                    {statusFilter !== "all" ? (
                      <>
                        <p>No tickets match this status.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setStatusFilter("all");
                            setPage(1);
                          }}
                        >
                          Clear status filter
                        </Button>
                      </>
                    ) : (
                      <>
                        <p>You have no support tickets yet.</p>
                        <Link href="/tickets/new">
                          <Button variant="outline" size="sm">
                            Open New Ticket
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((t) => (
                <TableRow
                  key={t._id}
                  className="cursor-pointer transition-colors"
                  onClick={() => router.push(`/tickets/${t._id}`)}
                >
                  <TableCell className="font-medium">
                    <Link
                      href={`/tickets/${t._id}`}
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t.ticketNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{t.subject}</TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {t.department}
                  </TableCell>
                  <TableCell>
                    <TicketPriorityBadge priority={t.priority} />
                  </TableCell>
                  <TableCell>
                    <TicketStatusBadge
                      status={t.status}
                      label={CLIENT_STATUS_LABELS[t.status]}
                    />
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatDate(t.lastRepliedAt || t.updatedAt || t.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: Card list */}
      <div className="space-y-3 sm:hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Loading tickets...</span>
          </div>
        ) : error ? (
          <p className="py-8 text-center text-destructive">Failed to load tickets.</p>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <MessageSquare className="h-12 w-12 opacity-40" />
              {statusFilter !== "all" ? (
                <>
                  <p>No tickets match this status.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                      setStatusFilter("all");
                      setPage(1);
                    }}
                  >
                    Clear status filter
                  </Button>
                </>
              ) : (
                <>
                  <p>You have no support tickets yet.</p>
                  <Link href="/tickets/new">
                    <Button variant="outline" size="sm">
                      Open New Ticket
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          tickets.map((t) => (
            <Link key={t._id} href={`/tickets/${t._id}`}>
              <Card
                className={cn(
                  "transition-all hover:border-primary/50 hover:shadow-md active:scale-[0.99]"
                )}
              >
                <CardContent className="flex flex-col gap-4 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-primary">{t.ticketNumber}</p>
                      <p className="truncate text-sm font-medium text-foreground">
                        {t.subject}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <TicketStatusBadge
                      status={t.status}
                      label={CLIENT_STATUS_LABELS[t.status]}
                    />
                    <TicketPriorityBadge priority={t.priority} />
                    <span className="text-xs text-muted-foreground">
                      {t.department}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(t.lastRepliedAt || t.updatedAt || t.createdAt)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {!isLoading && !error && tickets.length > 0 && (
        <DataTablePagination
          page={page}
          totalPages={totalPages}
          totalItems={totalResults}
          pageSize={pageSize}
          currentCount={tickets.length}
          itemLabel="tickets"
          onPageChange={setPage}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setPage(1);
          }}
          variant="compact"
          showJumpToPage={false}
        />
      )}
    </div>
  );
}
