"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetAllInvoicesQuery } from "@/store/api/invoiceApi";
import { formatCurrency } from "@/utils/format";
import { INVOICE_STATUS_ADMIN } from "@/constants/status";

export interface DashboardRecentInvoicesProps {
  clientId: string;
  limit?: number;
  viewAllHref?: string;
}

export function DashboardRecentInvoices({
  clientId,
  limit = 5,
  viewAllHref = "/invoices",
}: DashboardRecentInvoicesProps) {
  const { data, isLoading } = useGetAllInvoicesQuery(
    { clientId, limit, page: 1 },
    { skip: !clientId }
  );

  const invoices = data?.results ?? [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invoices yet.</p>
        ) : (
          <ul className="space-y-2">
            {invoices.slice(0, limit).map((inv) => (
              <li
                key={inv._id}
                className="flex items-center justify-between text-sm"
              >
                <Link
                  href={`/invoices/${inv._id}`}
                  className="font-medium text-primary hover:underline"
                >
                  #{inv.invoiceNumber}
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {formatCurrency(inv.total ?? 0, inv.currency)}
                  </span>
                  <Badge
                    variant={inv.status === INVOICE_STATUS_ADMIN.PAID ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {inv.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!isLoading && invoices.length > 0 && (
          <Link
            href={viewAllHref}
            className="text-xs text-primary hover:underline mt-2 inline-block"
          >
            View all invoices
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
