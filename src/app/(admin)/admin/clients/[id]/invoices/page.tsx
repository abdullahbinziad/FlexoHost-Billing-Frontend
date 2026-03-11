"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGetAllInvoicesQuery } from "@/store/api/invoiceApi";
import { formatDate } from "@/utils/format";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

export default function ClientInvoicesPage() {
  const params = useParams();
  const clientId = params?.id as string;
  const formatCurrency = useFormatCurrency();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useGetAllInvoicesQuery({
    clientId,
    page,
    limit,
  });

  const invoices = data?.results ?? [];
  const totalResults = data?.totalResults ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl">Invoices</CardTitle>
          <p className="text-sm text-muted-foreground">Billing history and unpaid invoices</p>
        </div>
        <Button asChild>
          <Link href="/admin/billing/invoices">
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        <div className="rounded-md border bg-white dark:bg-gray-900">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                <TableHead className="w-[100px]">Invoice #</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Loading invoices...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-destructive">
                    Failed to load invoices.
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No invoices for this client.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv._id}>
                    <TableCell className="font-medium text-blue-600">
                      <Link
                        href={`/admin/clients/${clientId}/invoices/${inv._id}`}
                        className="hover:underline"
                      >
                        #{inv.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(inv.invoiceDate)}</TableCell>
                    <TableCell>{formatDate(inv.dueDate)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(inv.total ?? 0, inv.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          inv.status === "PAID"
                            ? "bg-green-500 hover:bg-green-600"
                            : inv.status === "UNPAID" || inv.status === "OVERDUE"
                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200"
                            : ""
                        }
                        variant={inv.status === "PAID" ? "default" : "secondary"}
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/admin/clients/${clientId}/invoices/${inv._id}`}>
                              <DropdownMenuItem>View Invoice</DropdownMenuItem>
                            </Link>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <span>
              {totalResults} invoice{totalResults !== 1 ? "s" : ""} total
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span>Page {page} of {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
