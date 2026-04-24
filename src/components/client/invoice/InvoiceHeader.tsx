"use client";

import { cn } from "@/lib/utils";
import { formatInvoiceDate, getInvoiceStatusStyles } from "./invoice.utils";
import type { Invoice } from "@/types/invoice";
import { INVOICE_STATUS } from "@/constants/status";

interface InvoiceHeaderProps {
  invoice: Invoice;
}

export function InvoiceHeader({ invoice }: InvoiceHeaderProps) {
  return (
    <div
      data-invoice-header
      className="border-b border-gray-200 px-4 pb-6 pt-6 dark:border-gray-700 sm:px-6 sm:pb-8 sm:pt-8 md:px-8 md:pt-10 print:px-6 print:pb-5 print:pt-6"
    >
      <div className="mb-6 flex flex-col gap-6 md:mb-8 md:flex-row md:items-start md:justify-between md:gap-8">
        <div className="min-w-0 flex-1">
          <div className="space-y-4">
            <div>
              <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl md:mb-3 md:text-5xl">
                INVOICE
              </h2>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
                  Invoice Number
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
                  {invoice.invoiceNumber}
                </p>
              </div>
            </div>
            <div className="pt-2 flex flex-col gap-1">
              <span
                className={cn(
                  "inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-bold border-2 uppercase tracking-wide shadow-sm w-fit",
                  getInvoiceStatusStyles(invoice.status)
                )}
              >
                {invoice.status}
              </span>
              {invoice.status === INVOICE_STATUS.PAID && invoice.paymentMethod && (
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  via {invoice.paymentMethod}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="shrink-0 md:max-w-[45%]">
          <div className="flex flex-col items-start space-y-4 md:items-end md:space-y-6">
            <img
              src="/img/company/FlexoHostHorizontalforLight.webp"
              alt="Company Logo"
              width={200}
              height={60}
              loading="eager"
              decoding="sync"
              data-invoice-logo
              className="h-auto max-w-[160px] object-contain sm:max-w-[200px]"
            />
            <div className="w-full space-y-3 text-left md:text-right">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-1">
                  Invoice Date
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatInvoiceDate(invoice.invoiceDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-1">
                  Due Date
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatInvoiceDate(invoice.dueDate)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
