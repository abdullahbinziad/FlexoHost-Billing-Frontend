"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGetTransactionsQuery } from "@/store/api/transactionApi";
import { formatDate } from "@/utils/format";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { DataTablePagination } from "@/components/shared/DataTablePagination";

export default function ClientTransactionsPage() {
  const params = useParams();
  const clientId = params?.id as string;
  const formatCurrency = useFormatCurrency();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useGetTransactionsQuery(
    { clientId, page, limit },
    { skip: !clientId }
  );

  const transactions = data?.results ?? [];
  const totalResults = data?.totalResults ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl">Transactions</CardTitle>
          <p className="text-sm text-muted-foreground">Payment history and refunds</p>
        </div>
        <Button variant="outline" disabled>
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        <div className="rounded-md border bg-white dark:bg-gray-900">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-destructive">
                    Failed to load transactions.
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No transactions for this client.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx._id}>
                    <TableCell className="font-medium text-blue-600">
                      <span className="text-xs text-gray-400">#</span>
                      {tx.externalTransactionId || tx._id.slice(-8)}
                    </TableCell>
                    <TableCell>{formatDate(tx.createdAt)}</TableCell>
                    <TableCell>{tx.gateway || "—"}</TableCell>
                    <TableCell>{tx.type === "REFUND" ? "Refund" : "Charge"}</TableCell>
                    <TableCell>{tx.status}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        tx.type === "REFUND" ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {tx.type === "REFUND" ? "-" : ""}
                      {formatCurrency(tx.amount ?? 0, tx.currency)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4">
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalResults}
            pageSize={limit}
            currentCount={transactions.length}
            itemLabel="transactions"
            onPageChange={setPage}
          />
        </div>
      </CardContent>
    </Card>
  );
}
