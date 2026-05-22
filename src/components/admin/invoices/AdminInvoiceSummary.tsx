"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Ban, Mail, Trash2 } from "lucide-react";
import type { InvoiceApiResponse } from "@/store/api/invoiceApi";

const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
        case "PAID":
            return "bg-emerald-500/90 text-white";
        case "UNPAID":
        case "OVERDUE":
            return "bg-rose-500/90 text-white";
        case "CANCELLED":
            return "bg-slate-500/90 text-white";
        default:
            return "bg-amber-500/90 text-white";
    }
};

function toDateInputValue(date: string | Date | undefined) {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().slice(0, 10);
}

interface AdminInvoiceSummaryProps {
    invoice: InvoiceApiResponse;
    invoiceDate?: string;
    dueDate?: string;
    onInvoiceDateChange?: (date: string) => void;
    onDueDateChange?: (date: string) => void;
    onStatusChange: (status: string) => void;
    onSendReminder?: () => void;
    onDelete?: () => void;
    isUpdating?: boolean;
    editable?: boolean;
}

export function AdminInvoiceSummary({
    invoice,
    invoiceDate,
    dueDate,
    onInvoiceDateChange,
    onDueDateChange,
    onStatusChange,
    onSendReminder,
    onDelete,
    isUpdating,
    editable = true,
}: AdminInvoiceSummaryProps) {
    const formatCurrency = useFormatCurrency();
    const bt = invoice.billedTo ?? {};
    const clientName = bt.customerName || bt.companyName || "—";
    const invDate = invoiceDate ?? invoice.invoiceDate;
    const dDate = dueDate ?? invoice.dueDate;
    const subtotal = invoice.subTotal ?? invoice.total ?? 0;
    const credit = invoice.credit ?? 0;
    const total = invoice.total ?? subtotal;
    const balance = invoice.balanceDue ?? total - credit;

    return (
        <div className="rounded-lg border bg-card p-6 space-y-5 min-w-0">
            {/* Client */}
            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Client
                </p>
                <Link
                    href={invoice.clientId ? `/admin/clients/${invoice.clientId}` : "#"}
                    className={cn(
                        "font-medium hover:underline",
                        invoice.clientId
                            ? "text-primary"
                            : "text-muted-foreground cursor-default"
                    )}
                >
                    {clientName}
                </Link>
            </div>

            {/* Invoice */}
            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Invoice
                </p>
                <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
                <div className="min-w-0">
                    <Label className="text-xs">Invoice Date</Label>
                    {editable && onInvoiceDateChange ? (
                        <Input
                            type="date"
                            value={toDateInputValue(invDate)}
                            onChange={(e) => onInvoiceDateChange(e.target.value)}
                            className="mt-1 h-9 w-full"
                        />
                    ) : (
                        <p className="mt-1 text-sm font-medium">
                            {invDate ? new Date(invDate).toLocaleDateString("en-GB") : "—"}
                        </p>
                    )}
                </div>
                <div className="min-w-0">
                    <Label className="text-xs">Due Date</Label>
                    {editable && onDueDateChange ? (
                        <Input
                            type="date"
                            value={toDateInputValue(dDate)}
                            onChange={(e) => onDueDateChange(e.target.value)}
                            className="mt-1 h-9 w-full"
                        />
                    ) : (
                        <p className="mt-1 text-sm font-medium">
                            {dDate ? new Date(dDate).toLocaleDateString("en-GB") : "—"}
                        </p>
                    )}
                </div>
            </div>

            {/* Status & Actions */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Badge className={cn("uppercase text-xs", getStatusColor(invoice.status))}>
                        {invoice.status}
                    </Badge>
                    {invoice.paymentMethod && (
                        <span className="text-xs text-muted-foreground truncate">
                            {invoice.paymentMethod}
                        </span>
                    )}
                </div>
                <div className="grid grid-cols-2  gap-2">
                    {/* 1. Mark Unpaid */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onStatusChange("UNPAID")}
                        disabled={isUpdating || (invoice.status === "UNPAID" || invoice.status === "OVERDUE")}
                        className="h-9 gap-1.5 w-full justify-start"
                    >
                        <XCircle className="h-3.5 w-3.5 shrink-0" />
                        Mark Unpaid
                    </Button>

                    {/* 2. Mark Cancelled */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onStatusChange("CANCELLED")}
                        disabled={isUpdating || invoice.status === "CANCELLED"}
                        className="h-9 gap-1.5 w-full justify-start"
                    >
                        <Ban className="h-3.5 w-3.5 shrink-0" />
                        Mark Cancelled
                    </Button>

                    {/* 3. Send Reminder */}
                    {onSendReminder && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onSendReminder}
                            disabled={isUpdating || invoice.status === "PAID" || invoice.status === "CANCELLED"}
                            className="h-9 gap-1.5 w-full justify-start"
                        >
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            Send Reminder
                        </Button>
                    )}

                    {/* 4. Delete */}
                    {onDelete && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDelete}
                            disabled={isUpdating}
                            className="h-9 gap-1.5 w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="h-3.5 w-3.5 shrink-0" />
                            Delete
                        </Button>
                    )}

                    {/* 5. Mark Paid (last in order) - full width */}
                    <Button
                        size="sm"
                        onClick={() => onStatusChange("PAID")}
                        disabled={isUpdating || invoice.status === "PAID"}
                        className="col-span-2 h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 w-full justify-start"
                    >
                        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                        Mark Paid
                    </Button>
                </div>
            </div>

            {/* Amounts */}
            <div className="rounded-md bg-muted/40 p-4 space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal, invoice.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Credit</span>
                    <span>{formatCurrency(credit, invoice.currency)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(total, invoice.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Balance</span>
                    <span
                        className={cn(
                            "font-medium",
                            balance > 0 && "text-rose-600 dark:text-rose-400"
                        )}
                    >
                        {formatCurrency(balance, invoice.currency)}
                    </span>
                </div>
            </div>
        </div>
    );
}
