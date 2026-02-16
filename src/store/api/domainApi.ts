import { api } from "./baseApi";
import type { Domain, BulkAction } from "@/types/domain";

export interface GetDomainsResponse {
  domains: Domain[];
  total: number;
}

export interface UpdateDomainRequest {
  domainId: string;
  autoRenewal?: boolean;
}

export interface RenewDomainRequest {
  domainId: string;
  years?: number;
}

export const domainApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all domains
    getDomains: builder.query<GetDomainsResponse, void>({
      query: () => "/domains",
      providesTags: ["Domain"],
    }),

    // Update domain (e.g., auto-renewal toggle)
    updateDomain: builder.mutation<Domain, UpdateDomainRequest>({
      query: ({ domainId, ...data }) => ({
        url: `/domains/${domainId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Domain"],
    }),

    // Renew domain
    renewDomain: builder.mutation<{ success: boolean; message: string }, RenewDomainRequest>({
      query: (data) => ({
        url: `/domains/${data.domainId}/renew`,
        method: "POST",
        body: { years: data.years || 1 },
      }),
      invalidatesTags: ["Domain"],
    }),

    // Bulk actions
    bulkAction: builder.mutation<{ success: boolean; message: string }, BulkAction>({
      query: (data) => ({
        url: "/domains/bulk-action",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Domain"],
    }),

    // Delete domain
    deleteDomain: builder.mutation<{ success: boolean }, string>({
      query: (domainId) => ({
        url: `/domains/${domainId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Domain"],
    }),
  }),
});

export const {
  useGetDomainsQuery,
  useUpdateDomainMutation,
  useRenewDomainMutation,
  useBulkActionMutation,
  useDeleteDomainMutation,
} = domainApi;
