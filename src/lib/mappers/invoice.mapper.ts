/**
 * Invoice API response to frontend type mapper
 */

import type { Invoice } from "@/types/invoice";

/** Backend invoice response shape (flexible for API variations) */
export interface InvoiceApiResponse {
  _id: string;
  invoiceNumber: string;
  status?: string;
  invoiceDate?: string;
  createdAt?: string;
  dueDate: string;
  billedTo?: {
    companyName?: string;
    customerName?: string;
    address?: string;
    country?: string;
  };
  items?: Array<{ description: string; amount: number }>;
  subTotal: number;
  credit?: number;
  total: number;
  balanceDue: number;
  currency?: string;
  paymentMethod?: string;
  transactions?: Array<{
    _id?: string;
    date?: string;
    createdAt?: string;
    paymentMethod?: string;
    gateway?: string;
    transactionId?: string;
    id?: string;
    amount: number;
  }>;
}

export function mapInvoiceApiToFrontend(data: InvoiceApiResponse | Record<string, unknown>): Invoice {
  const d = data as InvoiceApiResponse;
  return {
    id: d._id,
    invoiceNumber: d.invoiceNumber,
    status: (d.status?.toLowerCase() || "unpaid") as Invoice["status"],
    invoiceDate: d.invoiceDate || d.createdAt || "",
    dueDate: d.dueDate,
    payTo: {
      name: "FlexoHost",
      email: "billing@flexohost.com",
      address: "Ghunti, Mymensingh Sadar, Mymensingh, Bangladesh, Post-2200",
    },
    paymentMethod:
      d.paymentMethod ||
      d.transactions?.[0]?.paymentMethod ||
      d.transactions?.[0]?.gateway,
    paymentMethodsUrl: "/payment",
    invoicedTo: {
      companyName: d.billedTo?.companyName,
      name: d.billedTo?.customerName || "N/A",
      address: {
        street: d.billedTo?.address || "N/A",
        city: "",
        state: "",
        zipCode: "",
        country: d.billedTo?.country || "N/A",
      },
    },
    items: (d.items || []).map((item, idx) => ({
      id: String(idx + 1),
      description: item.description,
      amount: item.amount,
    })),
    subtotal: d.subTotal,
    credit: d.credit || 0,
    total: d.total,
    balance: d.balanceDue,
    transactions: (d.transactions || []).map((tx) => ({
      id: tx._id || tx.transactionId || "—",
      date: tx.date || tx.createdAt || "",
      gateway: tx.paymentMethod || tx.gateway || "—",
      transactionId: tx.transactionId || tx.id || "—",
      amount: tx.amount,
    })),
    currency: d.currency || "USD",
  };
}
