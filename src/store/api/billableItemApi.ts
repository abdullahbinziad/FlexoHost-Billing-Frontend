import { api } from "./baseApi";

export type InvoiceAction =
    | "DONT_INVOICE"
    | "INVOICE_ON_CRON"
    | "ADD_TO_NEXT_INVOICE"
    | "INVOICE_NORMAL"
    | "RECUR";

export type RecurUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";

export interface BillableItem {
    _id: string;
    clientId: string | { _id: string; firstName?: string; lastName?: string; companyName?: string; contactEmail?: string };
    productId?: string | { _id: string; name?: string } | null;
    description: string;
    unitType: "hours" | "qty";
    hoursOrQty: number;
    amount: number;
    invoiceAction: InvoiceAction;
    dueDate: string;
    recurEvery?: number;
    recurUnit?: RecurUnit;
    recurCount?: number;
    invoiceCount: number;
    invoiced: boolean;
    invoiceId?: string | null;
    currency: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface BillableItemListParams {
    page?: number;
    limit?: number;
    search?: string;
    clientId?: string;
    invoiced?: boolean;
    invoiceAction?: string;
    recurring?: boolean;
}

export interface BillableItemListResponse {
    results: BillableItem[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}

export interface CreateBillableItemPayload {
    clientId: string;
    productId?: string;
    description: string;
    unitType?: "hours" | "qty";
    hoursOrQty?: number;
    amount: number;
    invoiceAction?: string;
    dueDate: string;
    recurEvery?: number;
    recurUnit?: string;
    recurCount?: number;
    currency?: string;
}

export const billableItemApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getBillableItems: builder.query<BillableItemListResponse, BillableItemListParams | void>({
            query: (params) => ({
                url: "/billable-items",
                params: params ?? {},
            }),
            transformResponse: (response: { data?: BillableItemListResponse }) =>
                response?.data ?? (response as unknown as BillableItemListResponse),
            providesTags: (result) =>
                result
                    ? [
                          ...result.results.map(({ _id }) => ({ type: "BillableItem" as const, id: _id })),
                          { type: "BillableItem", id: "LIST" },
                      ]
                    : [{ type: "BillableItem", id: "LIST" }],
        }),

        getBillableItemById: builder.query<BillableItem, string>({
            query: (id) => `/billable-items/${id}`,
            transformResponse: (response: { data?: BillableItem }) =>
                response?.data ?? (response as unknown as BillableItem),
            providesTags: (_result, _err, id) => [{ type: "BillableItem", id }],
        }),

        createBillableItem: builder.mutation<BillableItem, CreateBillableItemPayload>({
            query: (body) => ({
                url: "/billable-items",
                method: "POST",
                body,
            }),
            transformResponse: (response: { data?: BillableItem }) =>
                response?.data ?? (response as unknown as BillableItem),
            invalidatesTags: [{ type: "BillableItem", id: "LIST" }],
        }),

        updateBillableItem: builder.mutation<
            BillableItem,
            { id: string; data: Partial<CreateBillableItemPayload> }
        >({
            query: ({ id, data }) => ({
                url: `/billable-items/${id}`,
                method: "PATCH",
                body: data,
            }),
            transformResponse: (response: { data?: BillableItem }) =>
                response?.data ?? (response as unknown as BillableItem),
            invalidatesTags: (_result, _err, { id }) => [
                { type: "BillableItem", id },
                { type: "BillableItem", id: "LIST" },
            ],
        }),

        deleteBillableItem: builder.mutation<void, string>({
            query: (id) => ({
                url: `/billable-items/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _err, id) => [
                { type: "BillableItem", id },
                { type: "BillableItem", id: "LIST" },
            ],
        }),

        bulkInvoiceOnCron: builder.mutation<{ message: string }, { ids: string[] }>({
            query: (body) => ({
                url: "/billable-items/bulk/invoice-on-cron",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "BillableItem", id: "LIST" }],
        }),

        bulkDeleteBillableItems: builder.mutation<{ message: string }, { ids: string[] }>({
            query: (body) => ({
                url: "/billable-items/bulk/delete",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "BillableItem", id: "LIST" }],
        }),
    }),
});

export const {
    useGetBillableItemsQuery,
    useGetBillableItemByIdQuery,
    useCreateBillableItemMutation,
    useUpdateBillableItemMutation,
    useDeleteBillableItemMutation,
    useBulkInvoiceOnCronMutation,
    useBulkDeleteBillableItemsMutation,
} = billableItemApi;
