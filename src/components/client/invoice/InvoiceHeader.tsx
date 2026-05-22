"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatInvoiceDate, getInvoiceStatusStyles } from "./invoice.utils";
import type { Invoice } from "@/types/invoice";

interface InvoiceHeaderProps {
  invoice: Invoice;
  isDark: boolean;
}

export function InvoiceHeader({ invoice, isDark }: InvoiceHeaderProps) {
  return (
    <div
      data-invoice-header
      className="border-b border-gray-200 dark:border-gray-700 px-8 pt-10 pb-8 print:pt-6 print:pb-5 print:px-6"
    >
      <div className="flex items-start justify-between gap-8 mb-8">
        <div className="flex-1">
          <div className="space-y-4">
            <div>
              <h2 className="text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                INVOICE
              </h2>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
                  Invoice Number
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
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
              {invoice.status === "paid" && invoice.paymentMethod && (
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  via {invoice.paymentMethod}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="flex flex-col items-end space-y-6">
            <Image
              src={
                isDark
                  ? "/img/company/FlexoHostHorizontalforDark.webp"
                  : "/img/company/FlexoHostHorizontalforLight.webp"
              }
              alt="Company Logo"
              width={200}
              height={60}
              className="object-contain"
            />
            <div className="text-right space-y-3 w-full">
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
