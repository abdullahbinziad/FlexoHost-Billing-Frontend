"use client";

import { InvoiceDetail } from "@/components/invoice/InvoiceDetail";
import type { Invoice } from "@/types/invoice";

// Mock invoice data - Replace with actual API call
const mockInvoice: Invoice = {
  id: "810041",
  invoiceNumber: "810041",
  status: "unpaid",
  invoiceDate: "2026-01-27",
  dueDate: "2026-02-10",
  payTo: {
    name: "SatisfyHost",
    email: "billing@satisfyhost.com",
  },
  paymentMethodsUrl: "https://satisfyhost.com/payment",
  note: "Payment processing fees may apply.",
  invoicedTo: {
    companyName: "Flex Softr",
    name: "ABDULLAH BIN ZIAD",
    address: {
      street: "Khordo",
      city: "Kalaroa",
      state: "Satkhira",
      zipCode: "9414",
      country: "Bangladesh",
    },
  },
  items: [
    {
      id: "1",
      description: "Basic - facebookryery.com (27/01/2026 - 26/01/2029) Server Location: UK",
      amount: 12912,
    },
    {
      id: "2",
      description: "Domain Registration - facebookryery.com - 4 Year/s (27/01/2026 - 26/01/2030)",
      amount: 5759,
    },
  ],
  subtotal: 18671,
  credit: 0,
  total: 18671,
  balance: 18671,
  transactions: [],
  currency: "BDT",
};

export default function InvoiceDetailPage() {
  return <InvoiceDetail invoice={mockInvoice} />;
}
