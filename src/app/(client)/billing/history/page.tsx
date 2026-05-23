"use client";

import { useState } from "react";
import { useGetTransactionsQuery } from "@/store/api/transactionApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, CreditCard } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/utils/format";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

export default function BillingHistory() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data, isLoading, error } = useGetTransactionsQuery({
    page,
    limit,
  });

  const transactions = data?.results ?? [];
  const totalResults = data?.totalResults ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const formatCurrency = useFormatCurrency();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-destructive">
        Failed to load billing history. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Billing History</h1>
        <p className="text-sm text-muted-foreground">
          A record of your invoice payments and refunds.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-white dark:bg-gray-900">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-10 text-muted-foreground"
                    >
                      <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-60" />
                      No billing history yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx._id}>
                      <TableCell>{formatDate(tx.createdAt)}</TableCell>
                      <TableCell>
                        {tx.invoiceId ? (
                          <Link
                            href={`/invoices/${tx.invoiceId._id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {tx.invoiceId.invoiceNumber}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="capitalize">
                        {tx.gateway || "—"}
                      </TableCell>
                      <TableCell className="uppercase text-xs">
                        {tx.status}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(tx.amount, tx.currency ?? "BDT")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
              <span>
                {totalResults} record{totalResults !== 1 ? "s" : ""} total
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
    </div>
  );
}
