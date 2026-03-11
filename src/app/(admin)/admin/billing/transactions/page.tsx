"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, Eye, CreditCard, MoreHorizontal, CheckCircle, XCircle, Ban, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useGetTransactionsQuery } from "@/store/api/transactionApi";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/utils/format";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
    { value: "SUCCESS", label: "Successful" },
    { value: "", label: "All" },
    { value: "FAILED", label: "Failed" },
    { value: "CANCELLED", label: "Cancelled" },
];

const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
        case "SUCCESS":
            return "bg-green-500 hover:bg-green-600";
        case "FAILED":
            return "bg-red-500 hover:bg-red-600";
        case "CANCELLED":
            return "bg-gray-500 hover:bg-gray-600";
        default:
            return "bg-yellow-500 hover:bg-yellow-600";
    }
};

export default function AdminTransactionsPage() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>("SUCCESS");

    const { data, isLoading, error, refetch } = useGetTransactionsQuery({
        page,
        limit,
        ...(statusFilter && { status: statusFilter }),
    });

    const transactions = data?.results ?? [];
    const totalResults = data?.totalResults ?? 0;
    const totalPages = data?.totalPages ?? 1;

    const formatCurrency = useFormatCurrency();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-destructive">
                Failed to load transactions. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Transactions
                </h1>
            </div>

            {/* Filter Section */}
            <Card className="p-4 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                <div className="flex flex-col lg:flex-row gap-4 items-end">
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                            <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
                                <SelectTrigger className="bg-white dark:bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex gap-2 items-end">
                        <Button variant="outline" onClick={() => { setStatusFilter("SUCCESS"); setPage(1); refetch(); }}>
                            Reset
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { setPage(1); refetch(); }}>
                            <Search className="w-4 h-4 mr-2" /> Refresh
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Results Info Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground bg-white dark:bg-gray-900 p-2 rounded-md border border-dashed border-gray-200 dark:border-gray-800">
                <span>
                    {totalResults} Record{totalResults !== 1 ? "s" : ""} Found
                    {totalResults > 0 && `, Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, totalResults)}`}
                </span>
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <span>Page:</span>
                            <Select value={String(page)} onValueChange={(v) => setPage(Number(v))}>
                                <SelectTrigger className="w-16 h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <SelectItem key={p} value={String(p)}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <span>Per page:</span>
                        <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                            <SelectTrigger className="w-14 h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="rounded-md border bg-white dark:bg-gray-900">
                <Table>
                    <TableHeader className="bg-blue-900">
                        <TableRow className="hover:bg-blue-900/90 border-none">
                            <TableHead className="w-[120px] text-white font-semibold">Invoice #</TableHead>
                            <TableHead className="text-white font-semibold">Client</TableHead>
                            <TableHead className="text-white font-semibold">Date</TableHead>
                            <TableHead className="text-white font-semibold">Payment Method</TableHead>
                            <TableHead className="text-white font-semibold">Status</TableHead>
                            <TableHead className="text-white font-semibold text-right">Amount</TableHead>
                            <TableHead className="text-right text-white font-semibold pr-4">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                    <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((tx) => (
                                <TableRow key={tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <TableCell className="font-medium text-blue-600">
                                        {tx.invoiceId ? (
                                            <Link href={`/admin/billing/invoices/${tx.invoiceId._id}`} className="hover:underline">
                                                {tx.invoiceId.invoiceNumber}
                                            </Link>
                                        ) : (
                                            "—"
                                        )}
                                    </TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-300">
                                        {tx.invoiceId?.billedTo?.customerName || tx.invoiceId?.billedTo?.companyName || "—"}
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        {formatDate(tx.createdAt)}
                                    </TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-300">
                                        {tx.gateway || "—"}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={cn(
                                                "uppercase text-[10px] px-1.5 py-0.5 rounded-sm text-white",
                                                getStatusColor(tx.status)
                                            )}
                                        >
                                            {tx.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(tx.amount, tx.currency ?? "BDT")}
                                    </TableCell>
                                    <TableCell className="text-right pr-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {tx.invoiceId && (
                                                <Link href={`/admin/billing/invoices/${tx.invoiceId._id}`}>
                                                    <Button variant="outline" size="sm" className="gap-1">
                                                        <Eye className="w-3 h-3" /> View Invoice
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
