"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, ChevronDown, Loader2 } from "lucide-react";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { cn } from "@/lib/utils";
import { PAYMENT_METHODS } from "./invoice.constants";
import type { Invoice } from "@/types/invoice";

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
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={onDownloadPDF}
        disabled={isGeneratingPDF}
      >
        {isGeneratingPDF ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {isGeneratingPDF ? "Generating..." : "Download PDF"}
      </Button>
      <Button variant="outline" size="sm" className="gap-2" onClick={onPrint}>
        <Printer className="w-4 h-4" />
        Print
      </Button>
    </div>
  );

  if (invoice.status === "unpaid") {
    return (
      <div className="lg:col-span-1 print:hidden">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm sticky top-20">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Invoice {invoice.invoiceNumber}
            </h1>
            <ActionButtons />
          </div>
          <div className="p-6 space-y-5">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1.5">Total Due</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
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
    <div className="lg:col-span-3 print:hidden mb-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Invoice {invoice.invoiceNumber}
          </h1>
          <ActionButtons />
        </div>
      </div>
    </div>
  );
}
