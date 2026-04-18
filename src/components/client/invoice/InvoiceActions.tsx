"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, ChevronDown, Loader2 } from "lucide-react";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { cn } from "@/lib/utils";
import { PAYMENT_METHODS } from "./invoice.constants";
import type { Invoice } from "@/types/invoice";
import { INVOICE_STATUS } from "@/constants/status";

interface InvoiceActionsProps {
  invoice: Invoice;
  onPayNow: (gateway: string) => Promise<void>;
  onDownloadPDF: () => Promise<void>;
  onPrint: () => void;
  isGeneratingPDF: boolean;
  isPaying: boolean;
}

export function InvoiceActions({
  invoice,
  onPayNow,
  onDownloadPDF,
  onPrint,
  isGeneratingPDF,
  isPaying,
}: InvoiceActionsProps) {
  const formatCurrency = useFormatCurrency();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("sslcommerz");
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  const handlePayNow = () => onPayNow(selectedPaymentMethod);

  const ActionButtons = () => (
    <div className="flex w-full min-w-0 flex-row items-stretch gap-2 sm:gap-3">
      <Button
        variant="outline"
        size="default"
        className="min-h-10 min-w-0 flex-1 gap-2"
        onClick={onDownloadPDF}
        disabled={isGeneratingPDF}
      >
        {isGeneratingPDF ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
        ) : (
          <Download className="h-4 w-4 shrink-0" />
        )}
        {isGeneratingPDF ? "Generating..." : "Download PDF"}
      </Button>
      <Button
        variant="outline"
        size="default"
        className="min-h-10 min-w-0 flex-1 gap-2"
        onClick={onPrint}
      >
        <Printer className="h-4 w-4 shrink-0" />
        Print
      </Button>
    </div>
  );

  if (invoice.status === INVOICE_STATUS.UNPAID) {
    return (
      <div className="lg:col-span-1 print:hidden">
        <div className="sticky top-16 z-10 rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:top-20">
          <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-800 sm:px-6">
            <h1 className="mb-3 break-words text-2xl font-bold text-gray-900 dark:text-gray-100 sm:mb-4 sm:text-3xl">
              Invoice {invoice.invoiceNumber}
            </h1>
            <ActionButtons />
          </div>
          <div className="space-y-5 p-4 sm:p-6">
            <div>
              <p className="mb-1.5 text-sm text-gray-600 dark:text-gray-400">Total Due</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                {formatCurrency(invoice.balance, invoice.currency)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Method:
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                  className="w-full px-4 py-3 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-between text-sm text-gray-900 dark:text-gray-100 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                >
                  <span>
                    {PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod)?.name ??
                      "Select Payment Method"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2",
                      showPaymentDropdown && "rotate-180"
                    )}
                  />
                </button>
                {showPaymentDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowPaymentDropdown(false)}
                    />
                    <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                      {PAYMENT_METHODS.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => {
                            setSelectedPaymentMethod(method.id);
                            setShowPaymentDropdown(false);
                          }}
                          className={cn(
                            "w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm",
                            selectedPaymentMethod === method.id &&
                              "bg-primary/10 dark:bg-primary/20 text-primary font-medium"
                          )}
                        >
                          {method.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <Button
              onClick={handlePayNow}
              className="w-full"
              size="lg"
              disabled={isPaying}
            >
              {isPaying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay Now"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 print:hidden sm:mb-6 lg:col-span-3">
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="break-words text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
            Invoice {invoice.invoiceNumber}
          </h1>
          <ActionButtons />
        </div>
      </div>
    </div>
  );
}
