"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, MessageSquare, ChevronRight, ChevronLeft } from "lucide-react";
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
import { useActiveClient } from "@/hooks/useActiveClient";
import { useGetTicketsQuery } from "@/store/api/ticketApi";
import { formatDate } from "@/utils/format";
import { TicketStatusBadge, TICKET_STATUS_LABELS } from "@/components/ticket/TicketStatusBadge";
import { TicketPriorityBadge } from "@/components/ticket/TicketPriorityBadge";
import { cn } from "@/lib/utils";

const CLIENT_STATUS_LABELS: Record<string, string> = {
  ...TICKET_STATUS_LABELS,
  answered: "Answered (waiting on you)",
  customer_reply: "Your reply sent",
};

export default function ClientTickets() {
  const router = useRouter();
  const { activeClientId } = useActiveClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data, isLoading, error } = useGetTicketsQuery({
    page,
    limit,
    ...(activeClientId ? { clientId: activeClientId } : {}),
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
                    <p>You have no support tickets yet.</p>
                    <Link href="/tickets/new">
                      <Button variant="outline" size="sm">
                        Open New Ticket
                      </Button>
                    </Link>
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
              <p>You have no support tickets yet.</p>
              <Link href="/tickets/new">
                <Button variant="outline" size="sm">
                  Open New Ticket
                </Button>
              </Link>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {totalResults} ticket{totalResults !== 1 ? "s" : ""} total
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Prev
            </Button>
            <span className="min-w-[100px] text-center text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
