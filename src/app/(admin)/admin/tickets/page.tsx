"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useGetTicketsQuery } from "@/store/api/ticketApi";
import { formatDate } from "@/utils/format";
import { TicketStatusBadge, TICKET_STATUS_LABELS } from "@/components/shared/ticket/TicketStatusBadge";
import { TicketPriorityBadge } from "@/components/shared/ticket/TicketPriorityBadge";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "@/components/shared/DataTablePagination";

const ADMIN_STATUS_LABELS: Record<string, string> = {
  ...TICKET_STATUS_LABELS,
  answered: "Answered (waiting client)",
  customer_reply: "Customer replied",
};

export default function AdminTicketsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data, isLoading, error } = useGetTicketsQuery({
    page,
    limit,
  });

  const tickets = data?.results ?? [];
  const totalResults = data?.totalResults ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          <MessageSquare className="h-7 w-7 text-primary" />
          Support Tickets
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage all client support tickets.
        </p>
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
                    <p>No tickets found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((t) => (
                <TableRow
                  key={t._id}
                  className="cursor-pointer transition-colors"
                  onClick={() => router.push(`/admin/tickets/${t._id}`)}
                >
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/tickets/${t._id}`}
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
                      label={ADMIN_STATUS_LABELS[t.status]}
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
              <p>No tickets found.</p>
            </CardContent>
          </Card>
        ) : (
          tickets.map((t) => (
            <Link key={t._id} href={`/admin/tickets/${t._id}`}>
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
                      label={ADMIN_STATUS_LABELS[t.status]}
                    />
                    <TicketPriorityBadge priority={t.priority} />
                    <span className="text-xs text-muted-foreground capitalize">
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

      {/* Pagination */}
      <DataTablePagination
        page={page}
        totalPages={totalPages}
        totalItems={totalResults}
        pageSize={limit}
        currentCount={tickets.length}
        itemLabel="tickets"
        onPageChange={setPage}
      />
    </div>
  );
}
