import { api } from "./baseApi";

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
            { page?: number; limit?: number; status?: string; clientId?: string }
        >({
            query: (params) => ({
                url: "/invoices",
                params,
            }),
            transformResponse: (response: any) => response.data,
            providesTags: ["Invoice"],
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
    usePayInvoiceMutation,
} = invoiceApi;
