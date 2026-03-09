"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ExternalLink, Printer, Download, Mail } from "lucide-react";

const REMINDER_OPTIONS = [
    { value: "invoice-created", label: "Invoice Created" },
    { value: "credit-card-invoice-created", label: "Credit Card Invoice Created" },
    { value: "invoice-payment-reminder", label: "Invoice Payment Reminder" },
    { value: "first-overdue-notice", label: "First Invoice Overdue Notice" },
    { value: "second-overdue-notice", label: "Second Invoice Overdue Notice" },
    { value: "third-overdue-notice", label: "Third Invoice Overdue Notice" },
    { value: "credit-card-payment-due", label: "Credit Card Payment Due" },
    { value: "credit-card-payment-failed", label: "Credit Card Payment Failed" },
    { value: "invoice-payment-confirmation", label: "Invoice Payment Confirmation" },
    { value: "credit-card-payment-confirmation", label: "Credit Card Payment Confirmation" },
    { value: "invoice-refund-confirmation", label: "Invoice Refund Confirmation" },
    { value: "direct-debit-payment-failed", label: "Direct Debit Payment Failed" },
    { value: "direct-debit-payment-confirmation", label: "Direct Debit Payment Confirmation" },
    { value: "direct-debit-payment-pending", label: "Direct Debit Payment Pending" },
    { value: "credit-card-payment-pending", label: "Credit Card Payment Pending" },
    { value: "invoice-modified", label: "Invoice Modified" },
];

interface AdminInvoiceHeaderProps {
    invoiceNumber: string;
    invoiceId: string;
    onPrint?: () => void;
    onDownload?: () => void;
    reminderType?: string;
    onReminderTypeChange?: (value: string) => void;
    onSendReminder?: () => void;
    isSendingReminder?: boolean;
}

export function AdminInvoiceHeader({
    invoiceNumber,
    invoiceId,
    onPrint,
    onDownload,
    reminderType = "invoice-payment-reminder",
    onReminderTypeChange,
    onSendReminder,
    isSendingReminder,
}: AdminInvoiceHeaderProps) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="h-9 w-9 shrink-0">
                <Link href="/admin/billing/invoices">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div className="shrink-0">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                    Invoice {invoiceNumber}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Edit invoice details and items
                </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Link href={`/invoices/${invoiceId}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-1.5 h-9">
                        <ExternalLink className="h-3.5 w-3.5" />
                        View as Client
                    </Button>
                </Link>
                <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={onPrint}>
                    <Printer className="h-3.5 w-3.5" />
                    Print
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={onDownload}>
                    <Download className="h-3.5 w-3.5" />
                    PDF
                </Button>
            </div>
            {onSendReminder && onReminderTypeChange && (
                <>
                    <Select
                        value={reminderType}
                        onValueChange={onReminderTypeChange}
                        disabled={isSendingReminder}
                    >
                        <SelectTrigger className="h-9 w-[240px] shrink-0">
                            <SelectValue placeholder="Select notification type" />
                        </SelectTrigger>
                        <SelectContent>
                            {REMINDER_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 h-9 shrink-0"
                        onClick={onSendReminder}
                        disabled={isSendingReminder}
                    >
                        <Mail className="h-3.5 w-3.5" />
                        Send Reminder
                    </Button>
                </>
            )}
        </div>
    );
}
