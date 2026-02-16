import { api } from "./baseApi";
import { TLD } from "@/types/admin";
import { ApiResponse } from "@/types/api";

export const tldApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getTlds: builder.query<TLD[], void>({
            query: () => "/domains/tld",
            transformResponse: (response: ApiResponse<TLD[]>) => response.data,
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ _id }) => ({ type: "TLD" as const, id: _id })),
                        { type: "TLD" as const, id: "LIST" },
                    ]
                    : [{ type: "TLD" as const, id: "LIST" }],
        }),
        createTld: builder.mutation<TLD, Partial<TLD>>({
            query: (body) => ({
                url: "/domains/tld",
                method: "POST",
                body,
            }),
            transformResponse: (response: ApiResponse<TLD>) => response.data,
            invalidatesTags: [{ type: "TLD", id: "LIST" }],
        }),
        updateTld: builder.mutation<TLD, { id: string; body: Partial<TLD> }>({
            query: ({ id, body }) => ({
                url: `/domains/tld/${id}`,
                method: "PATCH",
                body,
            }),
            transformResponse: (response: ApiResponse<TLD>) => response.data,
            invalidatesTags: (result, error, { id }) => [{ type: "TLD", id }],
        }),
        deleteTld: builder.mutation<void, string>({
            query: (id) => ({
                url: `/domains/tld/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "TLD", id: "LIST" }],
        }),
    }),
});

export const {
    useGetTldsQuery,
    useCreateTldMutation,
    useUpdateTldMutation,
    useDeleteTldMutation,
} = tldApi;
