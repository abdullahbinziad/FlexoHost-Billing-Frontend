import { api } from "./baseApi";

export type RunModuleCreateItem = {
    itemIndex: number;
    orderItemId?: string;
    serverId?: string;
    whmPackage?: string;
    username?: string;
    password?: string;
    runModuleCreate?: boolean;
    sendWelcomeEmail?: boolean;
};

export interface GetOrdersParams {
    clientId?: string;
    userId?: string;
    search?: string;
    status?: string;
    paymentStatus?: string;
    page?: number;
    limit?: number;
}

export interface OrdersListResponse<T = any> {
    results: T[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}

export interface OrderConfigResponse {
    serverLocations: Array<{ id: string; name: string }>;
    paymentMethods: Array<{ id: string; name: string }>;
    supportedCurrencies: string[];
}

export const orderApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getOrderConfig: builder.query<OrderConfigResponse, void>({
            query: () => "/orders/config",
            transformResponse: (response: { data?: OrderConfigResponse }) =>
                response?.data ?? (response as unknown as OrderConfigResponse),
            providesTags: ["Order"],
        }),
        getOrders: builder.query<OrdersListResponse, GetOrdersParams | void>({
            query: (params) => ({
                url: "/orders",
                params: params ?? {},
            }),
            transformResponse: (response: { data?: OrdersListResponse }) =>
                response?.data ?? (response as unknown as OrdersListResponse),
            providesTags: ["Order"],
        }),
        getOrderById: builder.query<any, string>({
            query: (id) => `/orders/${id}`,
            providesTags: (result, error, id) => [{ type: "Order", id }],
        }),
        updateOrderStatus: builder.mutation<
            { data: any },
            { orderId: string; status: string }
        >({
            query: ({ orderId, status }) => ({
                url: `/orders/${orderId}/status`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: (result, error, { orderId }) => [{ type: "Order", id: orderId }],
        }),
        runModuleCreate: builder.mutation<
            { results: Array<{ itemIndex: number; success: boolean; serverId?: string; accountUsername?: string; error?: string }> },
            { orderId: string; items: RunModuleCreateItem[] }
        >({
            query: ({ orderId, items }) => ({
                url: `/orders/${orderId}/run-module-create`,
                method: "POST",
                body: { items },
            }),
            invalidatesTags: (result, error, { orderId }) => [{ type: "Order", id: orderId }],
        }),
    }),
    overrideExisting: false,
});

export const { useGetOrdersQuery, useGetOrderByIdQuery, useGetOrderConfigQuery, useUpdateOrderStatusMutation, useRunModuleCreateMutation } = orderApi;
