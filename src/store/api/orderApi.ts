import { api } from "./baseApi";

export const orderApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getOrders: builder.query<any, void>({
            query: () => "/orders",
            providesTags: ["Order"],
        }),
        getOrderById: builder.query<any, string>({
            query: (id) => `/orders/${id}`,
            providesTags: (result, error, id) => [{ type: "Order", id }],
        }),
    }),
    overrideExisting: false,
});

export const { useGetOrdersQuery, useGetOrderByIdQuery } = orderApi;
