"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, Eye, FileText, MoreHorizontal, CheckCircle, XCircle, Ban, Mail } from "lucide-react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetAllInvoicesQuery, useUpdateInvoiceStatusMutation, useSendInvoiceReminderMutation } from "@/store/api/invoiceApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/utils/format";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { EmptyState } from "@/components/shared/EmptyState";

const STATUS_OPTIONS = [
    { value: "", label: "All" },
    { value: "UNPAID", label: "Unpaid" },
    { value: "PAID", label: "Paid" },
    { value: "OVERDUE", label: "Overdue" },
    { value: "CANCELLED", label: "Cancelled" },
];

const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
        case "PAID":
            return "bg-green-500 hover:bg-green-600";
        case "UNPAID":
            return "bg-red-500 hover:bg-red-600";
        case "OVERDUE":
            return "bg-orange-500 hover:bg-orange-600";
        case "CANCELLED":
            return "bg-gray-500 hover:bg-gray-600";
        default:
            return "bg-yellow-500 hover:bg-yellow-600";
    }
};

export default function AdminInvoicesPage() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [invoiceNumberDraft, setInvoiceNumberDraft] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState("");

    const { data, isLoading, error, refetch } = useGetAllInvoicesQuery({
        page,
        limit,
        ...(statusFilter && { status: statusFilter }),
        ...(invoiceNumber && { invoiceNumber }),
    });

    const [updateStatus, { isLoading: isUpdating }] = useUpdateInvoiceStatusMutation();
    const [sendReminder, { isLoading: isSendingReminder }] = useSendInvoiceReminderMutation();

    const invoices = data?.results ?? [];

    const handleUpdateStatus = async (invoiceId: string, status: string) => {
        try {
            await updateStatus({ id: invoiceId, status }).unwrap();
            toast.success(`Invoice marked as ${status.toLowerCase()}`);
        } catch {
            toast.error("Failed to update invoice status");
        }
    };

    const handleSendReminder = async (invoiceId: string) => {
        try {
            const result = await sendReminder(invoiceId).unwrap();
            toast.success(result.message);
        } catch {
            toast.error("Failed to send reminder");
        }
    };
    const totalResults = data?.totalResults ?? 0;
    const totalPages = data?.totalPages ?? 1;

    const formatCurrency = useFormatCurrency();

    const handleSearch = () => {
        setInvoiceNumber(invoiceNumberDraft.trim());
        setPage(1);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        const err = error as { status?: number; data?: { message?: string } };
        const message =
            err?.data?.message ||
            (err?.status === 401 ? "Please log in to continue." : null) ||
            (err?.status === 403 ? "You do not have permission to view invoices." : null) ||
            "Failed to load invoices. Please try again.";
        return (
            <div className="p-6 text-center text-destructive">
                {message}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Invoices
                </h1>
            </div>

            {/* Filter Section */}
            <Card className="p-4 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                <div className="flex flex-col lg:flex-row gap-4 items-end">
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Invoice #</label>
                            <Input
                                placeholder="Exact invoice number (e.g. INV-2024-001)"
                                className="bg-white dark:bg-background"
                                value={invoiceNumberDraft}
                                onChange={(e) => setInvoiceNumberDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleSearch();
                                    }
                                }}
                            />
                        </div>
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
                        <Button variant="outline" onClick={() => { setStatusFilter(""); setInvoiceNumberDraft(""); setInvoiceNumber(""); setPage(1); }}>
                            Reset
                        </Button>
                        <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSearch}>
                            <Search className="w-4 h-4 mr-2" /> Search
                        </Button>
                    </div>
                </div>
            </Card>

            {totalResults > 0 && (
                <DataTablePagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalResults}
                    pageSize={limit}
                    currentCount={invoices.length}
                    itemLabel="records"
                    onPageChange={setPage}
                    onPageSizeChange={(value) => {
                        setLimit(value);
                        setPage(1);
                    }}
                    pageSizeOptions={[10, 25, 50, 100]}
                />
            )}

            {totalResults === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No invoices found"
                    description={
                        statusFilter || invoiceNumber
                            ? "Try adjusting your filters or search criteria."
                            : "Invoices will appear here once orders are placed and invoices are generated."
                    }
                />
            ) : (
            <div className="rounded-md border bg-white dark:bg-gray-900">
                <Table>
                    <TableHeader className="bg-blue-900">
                        <TableRow className="hover:bg-blue-900/90 border-none">
                            <TableHead className="w-[120px] text-white font-semibold">Invoice #</TableHead>
                            <TableHead className="text-white font-semibold">Client</TableHead>
                            <TableHead className="text-white font-semibold">Invoice Date</TableHead>
                            <TableHead className="text-white font-semibold">Due Date</TableHead>
                            <TableHead className="text-white font-semibold">Status</TableHead>
                            <TableHead className="text-white font-semibold text-right">Total</TableHead>
                            <TableHead className="text-right text-white font-semibold pr-4">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice) => (
                                <TableRow key={invoice._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <TableCell className="font-medium text-blue-600">
                                        <Link href={`/admin/billing/invoices/${invoice._id}`} className="hover:underline">
                                            {invoice.invoiceNumber}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-300">
                                        {invoice.clientId ? (
                                            <Link
                                                href={`/admin/clients/${invoice.clientId}`}
                                                className="hover:underline text-blue-600 dark:text-blue-400"
                                            >
                                                {invoice.billedTo?.customerName || invoice.billedTo?.companyName || "—"}
                                            </Link>
                                        ) : (
                                            invoice.billedTo?.customerName || invoice.billedTo?.companyName || "—"
                                        )}
                                    </TableCell>
                                    <TableCell className="text-gray-500">{formatDate(invoice.invoiceDate)}</TableCell>
                                    <TableCell className="text-gray-500">{formatDate(invoice.dueDate)}</TableCell>
                                    <TableCell>
                                        <span
                                            className={cn(
                                                "uppercase text-[10px] px-1.5 py-0.5 rounded-sm text-white",
                                                getStatusColor(invoice.status)
                                            )}
                                        >
                                            {invoice.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(invoice.total, invoice.currency ?? "BDT")}
                                    </TableCell>
                                    <TableCell className="text-right pr-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/billing/invoices/${invoice._id}`}>
                                                <Button variant="outline" size="sm" className="gap-1">
                                                    <Eye className="w-3 h-3" /> View
                                                </Button>
                                            </Link>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isUpdating || isSendingReminder}>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {invoice.status !== "PAID" && (
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(invoice._id, "PAID")}>
                                                            <CheckCircle className="w-4 h-4 mr-2" /> Mark Paid
                                                        </DropdownMenuItem>
                                                    )}
                                                    {invoice.status !== "UNPAID" && invoice.status !== "OVERDUE" && (
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(invoice._id, "UNPAID")}>
                                                            <XCircle className="w-4 h-4 mr-2" /> Mark Unpaid
                                                        </DropdownMenuItem>
                                                    )}
                                                    {invoice.status !== "CANCELLED" && (
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(invoice._id, "CANCELLED")}>
                                                            <Ban className="w-4 h-4 mr-2" /> Mark Cancelled
                                                        </DropdownMenuItem>
                                                    )}
                                                    {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
                                                        <DropdownMenuItem onClick={() => handleSendReminder(invoice._id)}>
                                                            <Mail className="w-4 h-4 mr-2" /> Send Reminder
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>
            )}
        </div>
    );
}
