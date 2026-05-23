"use client";

import { use } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Printer, Send, CreditCard, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetInvoiceByIdQuery } from "@/store/api/invoiceApi";
import { formatDate, formatCurrency } from "@/utils/format";
import { Loader2 } from "lucide-react";
import { useSendInvoiceReminderMutation, useUpdateInvoiceStatusMutation } from "@/store/api/invoiceApi";
import { INVOICE_STATUS } from "@/constants/status";

export default function InvoiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string; invoiceId: string }>;
}) {
  const { id: clientId, invoiceId } = use(params);

  const { data: invoice, isLoading, error } = useGetInvoiceByIdQuery(invoiceId, {
    skip: !invoiceId,
  });

  const [sendReminder] = useSendInvoiceReminderMutation();
  const [updateStatus] = useUpdateInvoiceStatusMutation();

  const handleSendReminder = () => {
    sendReminder(invoiceId).catch(() => {});
  };

  const handleStatusChange = (status: string) => {
    updateStatus({ id: invoiceId, status }).catch(() => {});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="font-medium text-destructive">Invoice not found.</p>
        <p className="text-sm text-muted-foreground mt-1">
          It may have been deleted or the link is incorrect.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/admin/clients/${clientId}/invoices`}>Back to Invoices</Link>
        </Button>
      </div>
    );
  }

  const statusBadge =
    invoice.status === INVOICE_STATUS.PAID
      ? "bg-green-500 hover:bg-green-600"
      : invoice.status === INVOICE_STATUS.CANCELLED
        ? "bg-gray-500"
        : "bg-amber-500 hover:bg-amber-600";

  const addressLines = [
    invoice.billedTo?.address,
    invoice.billedTo?.country,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" asChild>
          <Link href={`/admin/clients/${clientId}/invoices`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            Invoice #{invoice.invoiceNumber}
            <Badge className={statusBadge}>{invoice.status}</Badge>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Created: {formatDate(invoice.invoiceDate)} • Due: {formatDate(invoice.dueDate)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {invoice.status !== INVOICE_STATUS.UNPAID && invoice.status !== INVOICE_STATUS.OVERDUE && (
                <DropdownMenuItem onClick={() => handleStatusChange(INVOICE_STATUS.UNPAID)}>
                  Mark Unpaid
                </DropdownMenuItem>
              )}
              {invoice.status !== INVOICE_STATUS.PAID && (
                <DropdownMenuItem onClick={handleSendReminder}>
                  Send Reminder
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-red-600">Delete Invoice</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-8">
              <div className="flex justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold mb-1">FlexoHost Ltd.</h2>
                  <div className="text-sm text-gray-500 space-y-0.5">
                    <p>123 Web Hosting Street</p>
                    <p>Dhaka, Bangladesh</p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">INVOICE</h3>
                  <p className="text-sm font-medium text-gray-500">#{invoice.invoiceNumber}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Invoiced To</h3>
                <h2 className="font-bold text-gray-900 dark:text-gray-100">
                  {invoice.billedTo?.customerName ?? invoice.billedTo?.companyName ?? "—"}
                </h2>
                {invoice.billedTo?.companyName && invoice.billedTo?.customerName && (
                  <p className="text-sm text-gray-500">{invoice.billedTo.companyName}</p>
                )}
                {addressLines.length > 0 && (
                  <div className="text-sm text-gray-500 space-y-0.5">
                    {addressLines.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                )}
              </div>

              <Table className="mb-8">
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items?.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="font-medium">{item.description}</div>
                        {item.period?.startDate && item.period?.endDate && (
                          <div className="text-xs text-gray-500">
                            {formatDate(item.period.startDate)} - {formatDate(item.period.endDate)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.amount, invoice.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-col items-end space-y-2 text-sm">
                <div className="flex justify-between w-48">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoice.subTotal, invoice.currency)}</span>
                </div>
                {invoice.credit > 0 && (
                  <div className="flex justify-between w-48">
                    <span className="text-gray-500">Credit:</span>
                    <span className="font-medium">-{formatCurrency(invoice.credit, invoice.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between w-48 text-base font-bold text-gray-900 dark:text-gray-100 border-t border-gray-200 dark:border-gray-800 pt-2 mt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.total, invoice.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="font-medium capitalize">{invoice.status}</span>
              </div>
              {invoice.paymentMethod && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium">{invoice.paymentMethod}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Balance Due</span>
                <span className="font-medium">{formatCurrency(invoice.balanceDue, invoice.currency)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button className="w-full justify-start" variant="secondary">
                <Send className="w-4 h-4 mr-2" /> Email Invoice
              </Button>
              <Button className="w-full justify-start" variant="secondary">
                <CreditCard className="w-4 h-4 mr-2" /> Refund Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
