/**
 * Store API Service
 * 
 * RTK Query API endpoints for public store data.
 * Does not require authentication.
 */

import { api } from "./baseApi";
import { Product } from "@/types/admin";
import { ApiResponse } from "@/types/api";

export interface StoreProductQueryParams {
    type?: string;
    group?: string;
    page?: number;
    limit?: number;
    sort?: string;
}

export interface StoreProductListResponse {
    products: Product[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

export const storeApi = api.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Get visible products for the public store / affiliate pages
         */
        getStoreProducts: builder.query<StoreProductListResponse, StoreProductQueryParams | void>({
            query: (params) => {
                const queryString = params
                    ? new URLSearchParams(
                        Object.entries(params).reduce((acc, [key, value]) => {
                            if (value !== undefined && value !== null) {
                                acc[key] = String(value);
                            }
                            return acc;
                        }, {} as Record<string, string>)
                    ).toString()
                    : "";

                return queryString ? `/store/products?${queryString}` : "/store/products";
            },
            transformResponse: (response: ApiResponse<StoreProductListResponse>) => response.data,
            providesTags: (result) =>
                result
                    ? [
                        ...result.products.map((product) => ({
                            type: "Product" as const,
                            id: product.id ?? (product as any)._id?.toString?.() ?? (product as any)._id,
                        })),
                        { type: "Product", id: "STORE_LIST" },
                    ]
                    : [{ type: "Product", id: "STORE_LIST" }],
        }),

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

export const { useGetStoreProductsQuery, useGetStoreProductQuery } = storeApi;
