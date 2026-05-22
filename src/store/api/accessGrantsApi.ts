import { api } from "./baseApi";
import { ApiResponse } from "@/types/api";
import type { AccessGrant, CreateGrantRequest, UpdateGrantRequest } from "@/types/grant-access";

export type { AccessGrant, CreateGrantRequest } from "@/types/grant-access";
export { getGrantClientId } from "@/types/grant-access";
/** Re-export for convenience when using grant-access and client profile together. Prefer importing from @/store/api/clientApi. */
export { useGetMyClientProfileQuery } from "./clientApi";

export const accessGrantsApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getGrantsSharedWithMe: builder.query<AccessGrant[], void>({
      query: () => "/clients/me/access-grants",
      transformResponse: (response: ApiResponse<AccessGrant[]>) => response.data ?? [],
      providesTags: [{ type: "AccessGrant", id: "SHARED_WITH_ME" }],
    }),
    getGrantsForClient: builder.query<AccessGrant[], string>({
      query: (clientId) => `/clients/${clientId}/access-grants`,
      transformResponse: (response: ApiResponse<AccessGrant[]>) => response.data ?? [],
      providesTags: (_result, _err, clientId) => [{ type: "AccessGrant", id: `CLIENT-${clientId}` }],
    }),
    createGrant: builder.mutation<AccessGrant, { clientId: string; body: CreateGrantRequest }>({
      query: ({ clientId, body }) => ({
        url: `/clients/${clientId}/access-grants`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<AccessGrant>) => response.data!,
      invalidatesTags: (_result, _err, { clientId }) => [
        { type: "AccessGrant", id: `CLIENT-${clientId}` },
        { type: "AccessGrant", id: "SHARED_WITH_ME" },
      ],
    }),
    updateGrant: builder.mutation<AccessGrant, { clientId: string; grantId: string; body: UpdateGrantRequest }>({
      query: ({ clientId, grantId, body }) => ({
        url: `/clients/${clientId}/access-grants/${grantId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<AccessGrant>) => response.data!,
      invalidatesTags: (_result, _err, { clientId }) => [
        { type: "AccessGrant", id: `CLIENT-${clientId}` },
        { type: "AccessGrant", id: "SHARED_WITH_ME" },
      ],
    }),
    revokeGrant: builder.mutation<void, { clientId: string; grantId: string }>({
      query: ({ clientId, grantId }) => ({
        url: `/clients/${clientId}/access-grants/${grantId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, { clientId }) => [
        { type: "AccessGrant", id: `CLIENT-${clientId}` },
        { type: "AccessGrant", id: "SHARED_WITH_ME" },
      ],
    }),
  }),
});

export const {
  useGetGrantsSharedWithMeQuery,
  useGetGrantsForClientQuery,
  useCreateGrantMutation,
  useUpdateGrantMutation,
  useRevokeGrantMutation,
} = accessGrantsApi;
