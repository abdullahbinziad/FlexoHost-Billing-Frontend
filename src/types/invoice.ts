/**
 * Invoice Type Definitions
 */

export type InvoiceStatus = "unpaid" | "paid" | "cancelled" | "refunded" | "pending";

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  quantity?: number;
}

export interface InvoiceTransaction {
  id: string;
  date: string;
  gateway: string;
  transactionId: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate: string;
  payTo: {
    name: string;
    email: string;
    address?: string;
  };
  paymentMethod?: string;
  paymentMethodsUrl: string;
  note?: string;
  invoicedTo: {
    companyName?: string;
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  items: InvoiceItem[];
  subtotal: number;
  credit: number;
  total: number;
  balance: number;
  transactions: InvoiceTransaction[];
  currency: string;
}
