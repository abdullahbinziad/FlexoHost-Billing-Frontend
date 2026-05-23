"use client";

import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { cn } from "@/lib/utils";
import { formatInvoiceDate, formatInvoicedAddress } from "./invoice.utils";
import type { Invoice } from "@/types/invoice";

interface InvoiceBodyProps {
  invoice: Invoice;
}

export function InvoiceBody({ invoice }: InvoiceBodyProps) {
  const formatCurrency = useFormatCurrency();
  const { invoicedTo } = invoice;

  return (
    <div className="invoice-body flex-1 space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6 md:px-8 print:space-y-4 print:px-6 print:py-4">
      {/* Pay To / Bill To */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
        <div>
          <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-2">
            Pay To:
          </h3>
          <div className="space-y-0.5 text-gray-900 dark:text-gray-100 text-sm">
            <p className="font-semibold">{invoice.payTo.name}</p>
            <p>{invoice.payTo.email}</p>
            {invoice.payTo.address && (
              <p className="text-gray-600 dark:text-gray-400">{invoice.payTo.address}</p>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-2">
            Invoiced To:
          </h3>
          <div className="space-y-0.5 text-gray-900 dark:text-gray-100 text-sm">
            {invoicedTo.companyName && (
              <p className="font-semibold">{invoicedTo.companyName}</p>
            )}
            <p className="font-semibold">{invoicedTo.name}</p>
            <p className="text-gray-600 dark:text-gray-400">
              {formatInvoicedAddress(invoicedTo.address)}
            </p>
          </div>
        </div>
      </div>

      {invoice.note && (
        <div className="pt-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 italic">
            Note: {invoice.note}
          </p>
        </div>
      )}

      {/* Items Table */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-3">
          Invoice Items
        </h3>
          <div className="-mx-1 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[280px] border-collapse">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="border border-gray-300 px-2 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-900 dark:border-gray-600 dark:text-gray-100 sm:px-4 sm:py-3 sm:text-xs">
                  Description
                </th>
                <th className="border border-gray-300 px-2 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-gray-900 dark:border-gray-600 dark:text-gray-100 sm:px-4 sm:py-3 sm:text-xs">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr
                  key={item.id}
                  className={cn(
                    "border-b border-gray-300 dark:border-gray-700",
                    index % 2 === 0 && "bg-gray-50 dark:bg-gray-900/50"
                  )}
                >
                  <td className="break-words border-r border-gray-300 px-2 py-2 text-xs text-gray-900 dark:border-gray-700 dark:text-gray-100 sm:px-3 sm:py-2.5 sm:text-sm">
                    {item.description}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-right text-xs font-semibold text-gray-900 dark:text-gray-100 sm:px-3 sm:py-2.5 sm:text-sm">
                    {formatCurrency(item.amount, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="ml-0 w-full max-w-full space-y-2 sm:ml-auto sm:max-w-xs">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Sub Total</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(invoice.subtotal, invoice.currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Credit</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(invoice.credit, invoice.currency)}
            </span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
            <span className="text-base font-bold text-gray-900 dark:text-gray-100">Total</span>
            <span className="text-base font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(invoice.total, invoice.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-3">
          Transactions
        </h3>
        {invoice.transactions.length > 0 ? (
          <div className="-mx-1 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                    Gateway
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                    Transaction ID
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.transactions.map((tx, index) => (
                  <tr
                    key={tx.id}
                    className={cn(
                      "border-b border-gray-100 dark:border-gray-800",
                      index % 2 === 0 && "bg-gray-50/50 dark:bg-gray-900/30"
                    )}
                  >
                    <td className="py-2 px-3 text-sm text-gray-900 dark:text-gray-100">
                      {formatInvoiceDate(tx.date)}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-900 dark:text-gray-100">
                      {tx.gateway}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {tx.transactionId}
                    </td>
                    <td className="py-2 px-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(tx.amount, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            No Related Transactions Found
          </p>
        )}
      </div>

      {/* Balance */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="ml-0 w-full max-w-full sm:ml-auto sm:max-w-xs">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Balance
            </span>
            <span
              className={cn(
                "text-base font-bold",
                invoice.balance > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              )}
            >
              {formatCurrency(invoice.balance, invoice.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
