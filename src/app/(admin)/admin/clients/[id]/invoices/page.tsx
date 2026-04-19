"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, MoreHorizontal, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAllInvoicesQuery } from "@/store/api/invoiceApi";
import { formatDate } from "@/utils/format";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { INVOICE_STATUS_ADMIN } from "@/constants/status";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: INVOICE_STATUS_ADMIN.UNPAID, label: "Unpaid" },
  { value: INVOICE_STATUS_ADMIN.PAID, label: "Paid" },
  { value: INVOICE_STATUS_ADMIN.OVERDUE, label: "Overdue" },
  { value: INVOICE_STATUS_ADMIN.CANCELLED, label: "Cancelled" },
];

export default function ClientInvoicesPage() {
  const params = useParams();
  const clientId = params?.id as string;
  const formatCurrency = useFormatCurrency();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [invoiceNumberDraft, setInvoiceNumberDraft] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const limit = 20;

  const { data, isLoading, error } = useGetAllInvoicesQuery({
    clientId,
    page,
    limit,
    status: statusFilter !== "all" ? statusFilter : undefined,
    invoiceNumber: invoiceNumber || undefined,
  });

  const invoices = data?.results ?? [];
  const totalResults = data?.totalResults ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handleSearch = () => {
    setInvoiceNumber(invoiceNumberDraft.trim());
    setPage(1);
  };

  const handleReset = () => {
    setStatusFilter("all");
    setInvoiceNumberDraft("");
    setInvoiceNumber("");
    setPage(1);
  };

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
            Open Invoice Center
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        <div className="mb-4 rounded-lg border bg-muted/20 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Invoice #
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Exact invoice number"
                  value={invoiceNumberDraft}
                  onChange={(e) => setInvoiceNumberDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="w-full lg:w-[180px]">
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
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
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
                          inv.status === INVOICE_STATUS_ADMIN.PAID
                            ? "bg-green-500 hover:bg-green-600"
                            : inv.status === INVOICE_STATUS_ADMIN.UNPAID || inv.status === INVOICE_STATUS_ADMIN.OVERDUE
                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200"
                            : ""
                        }
                        variant={inv.status === INVOICE_STATUS_ADMIN.PAID ? "default" : "secondary"}
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
        <div className="mt-4">
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalResults}
            pageSize={limit}
            currentCount={invoices.length}
            itemLabel="invoices"
            onPageChange={setPage}
          />
        </div>
      </CardContent>
    </Card>
  );
}
