"use client";

import { useRef, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { usePayInvoiceMutation } from "@/store/api/invoiceApi";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/types/invoice";
import { INVOICE_STATUS, PAYMENT_REDIRECT_STATUS } from "@/constants/status";
import { InvoiceHeader } from "./InvoiceHeader";
import { InvoiceBody } from "./InvoiceBody";
import { InvoiceActions } from "./InvoiceActions";
import { useInvoicePdf } from "./useInvoicePdf";

interface InvoiceDetailProps {
  invoice: Invoice;
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [payInvoice, { isLoading: isPaying }] = usePayInvoiceMutation();
  const searchParams = useSearchParams();
  const toastShown = useRef(false);

  const { generatePDF, isGeneratingPDF } = useInvoicePdf(
    invoiceRef,
    invoice.invoiceNumber
  );

  useEffect(() => {
    if (toastShown.current) return;
    const status = searchParams.get("payment");
    if (status === PAYMENT_REDIRECT_STATUS.SUCCESS) {
      toastShown.current = true;
      toast.success("Payment completed successfully!");
      window.history.replaceState(null, "", window.location.pathname);
    } else if (status === PAYMENT_REDIRECT_STATUS.FAILED) {
      toastShown.current = true;
      toast.error("Payment failed. Please try again or use a different method.");
      window.history.replaceState(null, "", window.location.pathname);
    } else if (status === PAYMENT_REDIRECT_STATUS.CANCELLED) {
      toastShown.current = true;
      toast.error("Payment was cancelled. You can try again.");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams]);

  const handlePayNow = async (gateway: string) => {
    try {
      const response = await payInvoice({
        invoiceId: invoice.id,
        gateway,
      }).unwrap();

      if (response?.GatewayPageURL) {
        window.location.href = response.GatewayPageURL;
      } else {
        toast.error(
          (response as { failedreason?: string })?.failedreason ??
            "Failed to retrieve payment gateway URL"
        );
      }
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message ?? "Failed to initiate payment");
    }
  };

  const handlePrint = () => window.print();

  return (
    <div
      className="mx-auto w-full min-w-0 max-w-7xl print:mx-0 print:max-w-none"
      ref={invoiceRef}
    >
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 print:grid-cols-1">
        <InvoiceActions
          invoice={invoice}
          onPayNow={handlePayNow}
          onDownloadPDF={generatePDF}
          onPrint={handlePrint}
          isGeneratingPDF={isGeneratingPDF}
          isPaying={isPaying}
        />

        <div
          className={cn(
            "lg:col-span-2",
            invoice.status === INVOICE_STATUS.UNPAID ? "" : "lg:col-span-3"
          )}
        >
          <div
            data-invoice-container
            className="invoice-a4 mx-auto flex w-full min-w-0 max-w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:max-w-[210mm] md:min-h-[297mm] print:max-w-none print:rounded-none print:border-0 print:shadow-none"
          >
            <InvoiceHeader invoice={invoice} isDark={isDark} />
            <InvoiceBody invoice={invoice} />
          </div>
        </div>
      </div>
    </div>
  );
}
