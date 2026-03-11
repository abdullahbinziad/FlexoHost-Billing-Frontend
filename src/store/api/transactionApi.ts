import { api } from "./baseApi";

export interface TransactionInvoiceSummary {
  _id: string;
  invoiceNumber: string;
  billedTo?: {
    companyName?: string;
    customerName?: string;
  };
  currency: string;
}

export interface Transaction {
  _id: string;
  invoiceId?: TransactionInvoiceSummary;
  orderId?: string;
  clientId?: string;
  userId?: string;
  gateway: string;
  type: "CHARGE" | "REFUND";
  status: "INITIATED" | "SUCCESS" | "FAILED" | "CANCELLED";
  amount: number;
  currency: string;
  externalTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetTransactionsResponse {
  results: Transaction[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface GetTransactionsParams {
  page?: number;
  limit?: number;
  status?: string;
  gateway?: string;
  clientId?: string;
}

export const transactionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<GetTransactionsResponse, GetTransactionsParams>({
      query: (params) => ({
        url: "/transactions",
        params,
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ["Transaction"],
    }),
  }),
});

export const { useGetTransactionsQuery } = transactionApi;

