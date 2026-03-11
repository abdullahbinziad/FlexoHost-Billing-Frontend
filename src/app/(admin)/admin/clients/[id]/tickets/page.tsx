"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGetTicketsQuery } from "@/store/api/ticketApi";
import { formatDate } from "@/utils/format";

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  answered: "Answered (waiting client)",
  customer_reply: "Customer replied",
  on_hold: "On hold",
  in_progress: "In progress",
  closed: "Closed",
};

export default function ClientTicketsPage() {
  const params = useParams();
  const clientId = params?.id as string;
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data, isLoading, error } = useGetTicketsQuery(
    { page, limit, clientId },
    { skip: !clientId }
  );

  const tickets = data?.results ?? [];
  const totalResults = data?.totalResults ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl">Support Tickets</CardTitle>
          <p className="text-sm text-muted-foreground">
            Support requests and communication history for this client.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tickets">
            <Plus className="w-4 h-4 mr-2" />
            Open New Ticket
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-0 space-y-3">
        <div className="rounded-md border bg-white dark:bg-gray-900">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                <TableHead className="w-[100px]">Ticket #</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Loading tickets...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-destructive">
                    Failed to load tickets.
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No tickets for this client yet.
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell className="font-medium text-blue-600">
                      <Link
                        href={`/admin/tickets/${t._id}`}
                        className="hover:underline"
                      >
                        {t.ticketNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{t.subject}</TableCell>
                    <TableCell className="capitalize">{t.department}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.status === "closed" || t.status === "resolved"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {STATUS_LABELS[t.status] ?? t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDate(t.lastRepliedAt || t.updatedAt || t.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>
              {totalResults} ticket{totalResults !== 1 ? "s" : ""} total
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
