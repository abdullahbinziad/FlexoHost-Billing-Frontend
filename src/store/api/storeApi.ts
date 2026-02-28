/**
 * Store API Service
 * 
 * RTK Query API endpoints for public store data.
 * Does not require authentication.
 */

import { api } from "./baseApi";
import { Product } from "@/types/admin";
import { ApiResponse } from "@/types/api";

export const storeApi = api.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Get a single product by ID (Public)
         */
        getStoreProduct: builder.query<Product, string>({
            query: (id) => `/store/products/${id}`,
            transformResponse: (response: ApiResponse<Product>) => response.data,
            providesTags: (result, error, id) => [{ type: "Product", id }],
        }),
    }),
});

export const { useGetStoreProductQuery } = storeApi;
