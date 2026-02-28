/**
 * Product API Service
 * 
 * RTK Query API endpoints for managing products (hosting packages, VPS, domains, SSL).
 * Follows the application's existing API conventions with proper caching and invalidation.
 */

import { api } from "./baseApi";
import { Product } from "@/types/admin";
import { ApiResponse } from "@/types/api";

/**
 * Product Query Parameters
 */
export interface ProductQueryParams {
    type?: string;
    group?: string;
    isHidden?: boolean;
    page?: number;
    limit?: number;
    sort?: string;
}

/**
 * Product List Response with Pagination
 */
export interface ProductListResponse {
    products: Product[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

/**
 * Create Product DTO
 */
export type CreateProductDTO = Omit<Product, "id" | "createdAt" | "isHidden">;

/**
 * Update Product DTO
 */
export type UpdateProductDTO = Partial<CreateProductDTO>;

/**
 * Product API Endpoints
 */
export const productApi = api.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        /**
         * Get all products with optional filtering and pagination
         */
        getProducts: builder.query<ProductListResponse, ProductQueryParams | void>({
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

                return queryString ? `/admin/products?${queryString}` : "/admin/products";
            },
            transformResponse: (response: ApiResponse<ProductListResponse>) => response.data,
            providesTags: (result) =>
                result
                    ? [
                        ...result.products.map(({ id }) => ({ type: "Product" as const, id })),
                        { type: "Product", id: "LIST" },
                    ]
                    : [{ type: "Product", id: "LIST" }],
        }),

        /**
         * Get a single product by ID
         */
        getProduct: builder.query<Product, string>({
            query: (id) => `/admin/products/${id}`,
            transformResponse: (response: ApiResponse<Product>) => response.data,
            providesTags: (result, error, id) => [{ type: "Product", id }],
        }),

        /**
         * Create a new product
         */
        createProduct: builder.mutation<Product, CreateProductDTO>({
            query: (data) => ({
                url: "/admin/products",
                method: "POST",
                body: data,
            }),
            transformResponse: (response: ApiResponse<Product>) => response.data,
            invalidatesTags: [{ type: "Product", id: "LIST" }],
        }),

        /**
         * Update an existing product
         */
        updateProduct: builder.mutation<Product, { id: string; data: UpdateProductDTO }>({
            query: ({ id, data }) => ({
                url: `/admin/products/${id}`,
                method: "PUT",
                body: data,
            }),
            transformResponse: (response: ApiResponse<Product>) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: "Product", id },
                { type: "Product", id: "LIST" },
            ],
        }),

        /**
         * Delete a product
         */
        deleteProduct: builder.mutation<void, string>({
            query: (id) => ({
                url: `/admin/products/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Product", id },
                { type: "Product", id: "LIST" },
            ],
        }),

        /**
         * Toggle product visibility
         */
        toggleProductVisibility: builder.mutation<
            { id: string; isHidden: boolean },
            { id: string; isHidden: boolean }
        >({
            query: ({ id, isHidden }) => ({
                url: `/admin/products/${id}/visibility`,
                method: "PATCH",
                body: { isHidden },
            }),
            transformResponse: (response: ApiResponse<{ id: string; isHidden: boolean }>) =>
                response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: "Product", id },
                { type: "Product", id: "LIST" },
            ],
        }),

        /**
         * Search products by term
         */
        searchProducts: builder.query<Product[], string>({
            query: (searchTerm) => `/admin/products/search?q=${encodeURIComponent(searchTerm)}`,
            transformResponse: (response: ApiResponse<Product[]>) => response.data,
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "Product" as const, id })),
                        { type: "Product", id: "SEARCH" },
                    ]
                    : [{ type: "Product", id: "SEARCH" }],
        }),

        /**
         * Get products by type
         */
        getProductsByType: builder.query<Product[], string>({
            query: (type) => `/admin/products/type/${type}`,
            transformResponse: (response: ApiResponse<Product[]>) => response.data,
            providesTags: (result, error, type) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "Product" as const, id })),
                        { type: "Product", id: `TYPE_${type}` },
                    ]
                    : [{ type: "Product", id: `TYPE_${type}` }],
        }),

        /**
         * Get products by group
         */
        getProductsByGroup: builder.query<Product[], string>({
            query: (group) => `/admin/products/group/${encodeURIComponent(group)}`,
            transformResponse: (response: ApiResponse<Product[]>) => response.data,
            providesTags: (result, error, group) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "Product" as const, id })),
                        { type: "Product", id: `GROUP_${group}` },
                    ]
                    : [{ type: "Product", id: `GROUP_${group}` }],
        }),
    }),
});

/**
 * Export hooks for use in components
 */
export const {
    useGetProductsQuery,
    useGetProductQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useToggleProductVisibilityMutation,
    useSearchProductsQuery,
    useLazySearchProductsQuery,
    useGetProductsByTypeQuery,
    useGetProductsByGroupQuery,
} = productApi;
