import { api } from "./baseApi";

export interface InvoiceItemPayload {
    type?: string;
    description: string;
    amount: number;
    period?: { startDate?: string; endDate?: string };
}

export interface InvoiceUpdatePayload {
    billedTo?: { companyName?: string; customerName?: string; address?: string; country?: string };
    invoiceDate?: string;
    dueDate?: string;
    items?: InvoiceItemPayload[];
    credit?: number;
    currency?: string;
}

export interface InvoiceApiResponse {
    _id: string;
    clientId: string;
    invoiceNumber: string;
    status: string;
    invoiceDate: string;
    dueDate: string;
    billedTo: {
        companyName?: string;
        customerName: string;
        address: string;
        country: string;
    };
    items: Array<{
        type: string;
        description: string;
        amount: number;
        period?: { startDate: string; endDate: string };
        meta?: Record<string, any>;
    }>;
    currency: string;
    subTotal: number;
    credit: number;
    total: number;
    balanceDue: number;
    orderId?: string;
    paymentMethod?: string;
    createdAt: string;
    updatedAt: string;
}

export const invoiceApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getInvoiceById: builder.query<InvoiceApiResponse, string>({
            query: (id) => `/invoices/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (_result, _error, id) => [{ type: "Invoice", id }],
        }),

        getAllInvoices: builder.query<
            {
                results: InvoiceApiResponse[];
                page: number;
                limit: number;
                totalPages: number;
                totalResults: number;
            },
            { page?: number; limit?: number; status?: string; clientId?: string; invoiceNumber?: string }
        >({
            query: (params) => ({
                url: "/invoices",
                params,
            }),
            transformResponse: (response: any) => response.data,
            providesTags: ["Invoice"],
        }),

        deleteInvoice: builder.mutation<void, string>({
            query: (id) => ({
                url: `/invoices/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Invoice", id },
                "Invoice",
            ],
        }),

        updateInvoiceStatus: builder.mutation<
            InvoiceApiResponse,
            { id: string; status: string }
        >({
            query: ({ id, status }) => ({
                url: `/invoices/${id}/status`,
                method: "PATCH",
                body: { status },
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Invoice", id },
                "Invoice",
            ],
        }),

        sendInvoiceReminder: builder.mutation<
            { sent: boolean; message: string },
            string | { id: string; template?: string }
        >({
            query: (arg) => {
                const id = typeof arg === "string" ? arg : arg.id;
                const template = typeof arg === "string" ? undefined : arg.template;
                return {
                    url: `/invoices/${id}/send-reminder`,
                    method: "POST",
                    body: template ? { template } : {},
                };
            },
            transformResponse: (response: any) => response.data,
            invalidatesTags: (_result, _error, arg) => {
                const id = typeof arg === "string" ? arg : arg.id;
                return [
                    { type: "Invoice", id },
                    "Invoice",
                ];
            },
        }),

        addPayment: builder.mutation<
            InvoiceApiResponse,
            {
                id: string;
                data: {
                    date: string;
                    amount: number;
                    paymentMethod: string;
                    transactionFees?: number;
                    transactionId?: string;
                    sendEmail?: boolean;
                };
            }
        >({
            query: ({ id, data }) => ({
                url: `/invoices/${id}/payments`,
                method: "POST",
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Invoice", id },
                "Invoice",
            ],
        }),

        updateInvoice: builder.mutation<
            InvoiceApiResponse,
            { id: string; data: Partial<InvoiceUpdatePayload> }
        >({
            query: ({ id, data }) => ({
                url: `/invoices/${id}`,
                method: "PATCH",
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Invoice", id },
                "Invoice",
            ],
        }),

        payInvoice: builder.mutation<
            { GatewayPageURL: string },
            { invoiceId: string; gateway: string }
        >({
            query: (data) => ({
                url: `/payment/pay-invoice`,
                method: "POST",
                body: data,
            }),
            transformResponse: (response: any) => response.data,
        }),
    }),
});

export const {
    useGetInvoiceByIdQuery,
    useGetAllInvoicesQuery,
    useUpdateInvoiceStatusMutation,
    useDeleteInvoiceMutation,
    usePayInvoiceMutation,
    useSendInvoiceReminderMutation,
    useUpdateInvoiceMutation,
    useAddPaymentMutation,
} = invoiceApi;
