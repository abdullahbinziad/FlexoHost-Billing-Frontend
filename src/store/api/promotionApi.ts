/**
 * Promotion (Coupon) API Service
 * RTK Query endpoints for managing promotions.
 */

import { api } from "./baseApi";
import { Promotion } from "@/types/admin/coupon";
import type { PromoDiscountMeta } from "@/types/checkout";
import { ApiResponse } from "@/types/api";

export interface PromotionQueryParams {
    isActive?: boolean;
    page?: number;
    limit?: number;
    search?: string;
}

export interface PromotionListResponse {
    promotions: Promotion[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

export type CreatePromotionDTO = Omit<Promotion, "_id" | "usageCount" | "createdAt" | "updatedAt">;
export type UpdatePromotionDTO = Partial<CreatePromotionDTO>;

export const promotionApi = api.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getPromotions: builder.query<PromotionListResponse, PromotionQueryParams | void>({
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
                return queryString ? `/promotions?${queryString}` : "/promotions";
            },
            transformResponse: (response: ApiResponse<PromotionListResponse>) => response.data,
            providesTags: (result) =>
                result
                    ? [
                        ...result.promotions.map(({ _id }) => ({ type: "Promotion" as const, id: _id })),
                        { type: "Promotion", id: "LIST" },
                    ]
                    : [{ type: "Promotion", id: "LIST" }],
        }),

        getPromotion: builder.query<Promotion, string>({
            query: (id) => `/promotions/${id}`,
            transformResponse: (response: ApiResponse<Promotion>) => response.data,
            providesTags: (result, error, id) => [{ type: "Promotion", id }],
        }),

        createPromotion: builder.mutation<Promotion, CreatePromotionDTO>({
            query: (data) => ({
                url: "/promotions",
                method: "POST",
                body: data,
            }),
            transformResponse: (response: ApiResponse<Promotion>) => response.data,
            invalidatesTags: [{ type: "Promotion", id: "LIST" }],
        }),

        updatePromotion: builder.mutation<Promotion, { id: string; data: UpdatePromotionDTO }>({
            query: ({ id, data }) => ({
                url: `/promotions/${id}`,
                method: "PUT",
                body: data,
            }),
            transformResponse: (response: ApiResponse<Promotion>) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: "Promotion", id },
                { type: "Promotion", id: "LIST" },
            ],
        }),

        deletePromotion: builder.mutation<void, string>({
            query: (id) => ({
                url: `/promotions/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Promotion", id },
                { type: "Promotion", id: "LIST" },
            ],
        }),

        togglePromotionActive: builder.mutation<
            { id: string; isActive: boolean },
            { id: string; isActive: boolean }
        >({
            query: ({ id, isActive }) => ({
                url: `/promotions/${id}/toggle`,
                method: "PATCH",
                body: { isActive },
            }),
            transformResponse: (response: ApiResponse<{ id: string; isActive: boolean }>) =>
                response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: "Promotion", id },
                { type: "Promotion", id: "LIST" },
            ],
        }),

        validateCoupon: builder.mutation<
            {
                valid: boolean;
                promotionId?: string;
                code?: string;
                discountAmount?: number;
                name?: string;
                source?: "promotion" | "affiliate";
                discountMeta?: PromoDiscountMeta;
            },
            { code: string; subtotal: number; currency?: string; clientId?: string; productIds?: string[]; productTypes?: string[]; productBillingCycle?: string; domainTlds?: string[]; domainBillingCycle?: string; isFirstOrder?: boolean }
        >({
            query: (body) => ({
                url: "/promotions/validate",
                method: "POST",
                body,
            }),
            transformResponse: (response: ApiResponse<any>) => response.data,
        }),

        getPromotionUsageStats: builder.query<
            { usage: any[]; totalDiscount: number; totalUsageCount: number },
            string
        >({
            query: (id) => `/promotions/${id}/usage`,
            transformResponse: (response: ApiResponse<any>) => response.data,
            providesTags: (result, error, id) => [{ type: "Promotion", id: `${id}-usage` }],
        }),
    }),
});

export const {
    useGetPromotionsQuery,
    useGetPromotionQuery,
    useCreatePromotionMutation,
    useUpdatePromotionMutation,
    useDeletePromotionMutation,
    useTogglePromotionActiveMutation,
    useValidateCouponMutation,
    useGetPromotionUsageStatsQuery,
} = promotionApi;
