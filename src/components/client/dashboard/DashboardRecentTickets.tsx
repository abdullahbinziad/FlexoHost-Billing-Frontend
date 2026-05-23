"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetTicketsQuery } from "@/store/api/ticketApi";

export interface DashboardRecentTicketsProps {
  clientId: string;
  limit?: number;
  viewAllHref?: string;
}

export function DashboardRecentTickets({
  clientId,
  limit = 5,
  viewAllHref = "/tickets",
}: DashboardRecentTicketsProps) {
  const { data, isLoading } = useGetTicketsQuery(
    { clientId, limit, page: 1 },
    { skip: !clientId }
  );

  const tickets = data?.results ?? [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tickets yet.</p>
        ) : (
          <ul className="space-y-2">
            {tickets.slice(0, limit).map((t) => (
              <li
                key={t._id}
                className="flex items-center justify-between text-sm gap-2"
              >
                <Link
                  href={`/tickets/${t._id}`}
                  className="font-medium text-primary hover:underline truncate min-w-0"
                >
                  #{t.ticketNumber} – {t.subject}
                </Link>
                <Badge variant="outline" className="text-xs capitalize shrink-0">
                  {t.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        {!isLoading && tickets.length > 0 && (
          <Link
            href={viewAllHref}
            className="text-xs text-primary hover:underline mt-2 inline-block"
          >
            View all tickets
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
