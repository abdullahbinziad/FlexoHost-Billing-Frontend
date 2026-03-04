"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Download, Printer, CreditCard, ChevronDown, Loader2 } from "lucide-react";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/types/invoice";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { usePayInvoiceMutation } from "@/store/api/invoiceApi";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface InvoiceDetailProps {
  invoice: Invoice;
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const formatCurrency = useFormatCurrency();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("sslcommerz");
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [payInvoice, { isLoading: isPaying }] = usePayInvoiceMutation();
  const searchParams = useSearchParams();
  const toastShown = useRef(false);

  useEffect(() => {
    if (toastShown.current) return;
    const paymentStatus = searchParams.get('payment');

    if (paymentStatus === 'success') {
      toastShown.current = true;
      toast.success('Payment completed successfully!');
      window.history.replaceState(null, '', window.location.pathname);
    } else if (paymentStatus === 'failed') {
      toastShown.current = true;
      toast.error('Payment failed. Please try again or use a different method.');
      window.history.replaceState(null, '', window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      toastShown.current = true;
      toast.error('Payment was cancelled. You can try again.');
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [searchParams]);

  const paymentMethods = [
    { id: "sslcommerz", name: "SSLCommerz - Nagad, Rocket, Upay & BD Cards" },
    { id: "bkash", name: "bKash Payment" },
  ];

  const handlePayNow = async () => {
    try {
      const response = await payInvoice({
        invoiceId: invoice.id,
        gateway: selectedPaymentMethod,
      }).unwrap();

      if (response?.GatewayPageURL) {
        window.location.href = response.GatewayPageURL;
      } else {
        // SSLCommerz might have returned status: FAILED and failedreason
        toast.error((response as any)?.failedreason || "Failed to retrieve payment gateway URL");
        console.error("SSLCommerz Init Error Response:", response);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error?.data?.message || "Failed to initiate payment");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-100 border-green-300 dark:border-green-700 shadow-green-200/50 dark:shadow-green-900/30";
      case "unpaid":
        return "bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-100 border-red-300 dark:border-red-700 shadow-red-200/50 dark:shadow-red-900/30";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-100 border-yellow-300 dark:border-yellow-700 shadow-yellow-200/50 dark:shadow-yellow-900/30";
      case "cancelled":
        return "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 shadow-gray-200/50 dark:shadow-gray-900/30";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 shadow-gray-200/50 dark:shadow-gray-900/30";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    setIsGeneratingPDF(true);
    try {
      // Get the invoice container element
      const invoiceElement = invoiceRef.current.querySelector('[data-invoice-container]') as HTMLElement;
      if (!invoiceElement) {
        console.error("Invoice container not found");
        setIsGeneratingPDF(false);
        return;
      }

      // Store original styles
      const originalStyles: { element: HTMLElement; display: string }[] = [];

      // Temporarily hide non-printable elements
      const hiddenElements = invoiceElement.querySelectorAll('.print\\:hidden');
      hiddenElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        originalStyles.push({ element: htmlEl, display: htmlEl.style.display });
        htmlEl.style.display = 'none';
      });

      // Ensure white background for PDF
      const originalBg = invoiceElement.style.backgroundColor;
      invoiceElement.style.backgroundColor = '#ffffff';

      // Capture the invoice as canvas with high quality
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: invoiceElement.scrollWidth,
        height: invoiceElement.scrollHeight,
        windowWidth: invoiceElement.scrollWidth,
        windowHeight: invoiceElement.scrollHeight,
      });

      // Restore original styles
      originalStyles.forEach(({ element, display }) => {
        element.style.display = display;
      });
      invoiceElement.style.backgroundColor = originalBg;

      // Calculate PDF dimensions (A4: 210mm x 297mm)
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF('portrait', 'mm', 'a4');

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png', 1.0);

      // If content fits in one page
      if (imgHeight <= 297) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        // Handle multi-page PDF
        const pageHeight = 297; // A4 height in mm
        let heightLeft = imgHeight;
        let position = 0;

        while (heightLeft > 0) {
          if (position !== 0) {
            pdf.addPage();
          }
          pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          position -= pageHeight;
        }
      }

      // Save the PDF
      pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto" ref={invoiceRef}>
      {/* Two Column Layout: Pay Now (Left) and Invoice (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1">
        {/* Left Column - Invoice Title, Buttons, and Pay Now Section - Only show for unpaid invoices */}
        {invoice.status === "unpaid" && (
          <div className="lg:col-span-1 print:hidden">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm sticky top-20">
              {/* Invoice Title and Action Buttons */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Invoice {invoice.invoiceNumber}
                  </h1>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                  >
                    {isGeneratingPDF ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {isGeneratingPDF ? "Generating..." : "Download PDF"}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
                    <Printer className="w-4 h-4" />
                    Print
                  </Button>
                </div>
              </div>

              {/* Pay Now Section */}
              <div className="p-6">
                <div className="space-y-5">
                  {/* Total Due */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1.5">Total Due</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(invoice.balance)}
                    </p>
                  </div>

                  {/* Payment Method Selector */}
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
                          {paymentMethods.find((m) => m.id === selectedPaymentMethod)?.name ||
                            "Select Payment Method"}
                        </span>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2",
                            showPaymentDropdown && "transform rotate-180"
                          )}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      {showPaymentDropdown && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowPaymentDropdown(false)}
                          />
                          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                            {paymentMethods.map((method) => (
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

                  {/* Pay Now Button */}
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
          </div>
        )}

        {/* Show Invoice Title and Buttons for Paid Invoices */}
        {invoice.status !== "unpaid" && (
          <div className="lg:col-span-3 print:hidden mb-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Invoice {invoice.invoiceNumber}
                </h1>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                  >
                    {isGeneratingPDF ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {isGeneratingPDF ? "Generating..." : "Download PDF"}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
                    <Printer className="w-4 h-4" />
                    Print
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Column - Invoice Container - A4 Size */}
        <div className={cn(
          "lg:col-span-2",
          invoice.status === "unpaid" ? "" : "lg:col-span-3"
        )}>
          <div
            data-invoice-container
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden print:border-0 print:shadow-none print:rounded-none"
            style={{
              width: '210mm',
              minHeight: '297mm',
              margin: '0 auto',
              padding: '0'
            }}
          >
            {/* Invoice Header */}
            <div className="border-b-2 border-gray-300 dark:border-gray-700 px-8 pt-10 pb-8">
              <div className="flex items-start justify-between gap-8 mb-8">
                {/* Left Side - Invoice Info */}
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
                    <div className="pt-2">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-bold border-2 uppercase tracking-wide shadow-sm",
                          getStatusColor(invoice.status)
                        )}
                      >
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side - Logo with more space */}
                <div className="flex-shrink-0">
                  <div className="flex flex-col items-end space-y-6">
                    <div className="mb-6">
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
                    </div>
                    <div className="text-right space-y-3 w-full">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-1">
                          Invoice Date
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {formatDate(invoice.invoiceDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-1">
                          Due Date
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Body */}
            <div className="px-8 py-6 space-y-6">
              {/* Pay To and Bill To Section */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-2 border-b border-gray-300 dark:border-gray-700 pb-1">
                    Pay To:
                  </h3>
                  <div className="space-y-0.5 text-gray-900 dark:text-gray-100 text-sm">
                    <p className="font-semibold">{invoice.payTo.name}</p>
                    <p>{invoice.payTo.email}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-2 border-b border-gray-300 dark:border-gray-700 pb-1">
                    Invoiced To:
                  </h3>
                  <div className="space-y-0.5 text-gray-900 dark:text-gray-100 text-sm">
                    {invoice.invoicedTo.companyName && (
                      <p className="font-semibold">{invoice.invoicedTo.companyName}</p>
                    )}
                    <p className="font-semibold">{invoice.invoicedTo.name}</p>
                    <p>
                      {invoice.invoicedTo.address.street}
                      {invoice.invoicedTo.address.street && ","} {invoice.invoicedTo.address.city}
                      {invoice.invoicedTo.address.city && ","} {invoice.invoicedTo.address.state}
                      {invoice.invoicedTo.address.state && ","} {invoice.invoicedTo.address.zipCode}
                    </p>
                    <p>{invoice.invoicedTo.address.country}</p>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="border-t border-gray-300 dark:border-gray-700 pt-4">
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-1">
                  Payment Methods:
                </h3>
                <a
                  href={invoice.paymentMethodsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm print:text-gray-900"
                >
                  {invoice.paymentMethodsUrl}
                </a>
                {invoice.note && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                    Note: {invoice.note}
                  </p>
                )}
              </div>

              {/* Invoice Items */}
              <div className="border-t border-gray-300 dark:border-gray-700 pt-4">
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-3">
                  Invoice Items
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-800">
                        <th className="text-left py-2 px-3 text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide border border-gray-300 dark:border-gray-700">
                          Description
                        </th>
                        <th className="text-right py-2 px-3 text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide border border-gray-300 dark:border-gray-700">
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
                          <td className="py-2.5 px-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-700">
                            {item.description}
                          </td>
                          <td className="py-2.5 px-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t-2 border-gray-300 dark:border-gray-700 pt-4">
                <div className="max-w-xs ml-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Sub Total</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(invoice.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Credit</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(invoice.credit)}
                    </span>
                  </div>
                  <div className="border-t-2 border-gray-300 dark:border-gray-700 pt-2 flex justify-between">
                    <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                      Total
                    </span>
                    <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(invoice.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transactions */}
              <div className="border-t border-gray-300 dark:border-gray-700 pt-4">
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-3">
                  Transactions
                </h3>
                {invoice.transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                          <th className="text-left py-2 px-3 text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide border border-gray-300 dark:border-gray-700">
                            Date
                          </th>
                          <th className="text-left py-2 px-3 text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide border border-gray-300 dark:border-gray-700">
                            Gateway
                          </th>
                          <th className="text-left py-2 px-3 text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide border border-gray-300 dark:border-gray-700">
                            Transaction ID
                          </th>
                          <th className="text-right py-2 px-3 text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide border border-gray-300 dark:border-gray-700">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.transactions.map((transaction, index) => (
                          <tr
                            key={transaction.id}
                            className={cn(
                              "border-b border-gray-300 dark:border-gray-700",
                              index % 2 === 0 && "bg-gray-50 dark:bg-gray-900/50"
                            )}
                          >
                            <td className="py-2 px-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-700">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-700">
                              {transaction.gateway}
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-900 dark:text-gray-100 font-mono border-r border-gray-300 dark:border-gray-700">
                              {transaction.transactionId}
                            </td>
                            <td className="py-2 px-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {formatCurrency(transaction.amount)}
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
              <div className="border-t-2 border-gray-300 dark:border-gray-700 pt-4">
                <div className="max-w-xs ml-auto">
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
                      {formatCurrency(invoice.balance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Footer */}
            <div className="border-t-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-8 py-4">
              <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
                {/* Row 1 - Company Name */}
                <div className="text-center">
                  <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">{invoice.payTo.name}</span>
                </div>

                {/* Row 2 - Contact Information */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                    <a
                      href={`mailto:${invoice.payTo.email}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {invoice.payTo.email}
                    </a>
                  </div>
                  <span className="text-gray-400 dark:text-gray-600">|</span>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500 dark:text-gray-400">Website:</span>
                    <a
                      href="https://satisfyhost.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      satisfyhost.com
                    </a>
                  </div>
                </div>

                {/* Row 3 - Slogan */}
                <div className="text-center">
                  <span className="font-bold text-primary dark:text-primary-300 uppercase tracking-wide">
                    FLEXIBLE • RELIABLE • AFFORDABLE
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-2">
                    - Web Hosting
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
