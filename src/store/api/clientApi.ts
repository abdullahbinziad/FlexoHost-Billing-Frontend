import { api } from "./baseApi";
import { ApiResponse } from "@/types/api";

export interface ClientListParams {
  page?: number;
  limit?: number;
  search?: string;
  supportPin?: string;
}

export interface ClientListResponse {
  clients: ClientListItem[];
  total: number;
  page: number;
  pages: number;
}

export interface ClientListItem {
  _id: string;
  clientId: number;
  firstName: string;
  lastName: string;
  companyName?: string;
  contactEmail?: string;
  phoneNumber?: string;
  address?: { street?: string; city?: string; state?: string; postCode?: string; country?: string };
  user?: { email?: string; active?: boolean };
  supportPin?: string;
  createdAt: string;
}

export interface SupportPinResponse {
  supportPin: string;
  lastGeneratedAt: string;
}

export interface SupportPinVerifyResponse {
  client: ClientListItem;
}

export interface CompleteProfileRequest {
  companyName?: string;
  phoneNumber?: string;
  address?: { street?: string; city?: string; state?: string; postCode?: string; country?: string };
}

export interface UpdateClientRequest {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  contactEmail?: string;
  phoneNumber?: string;
  address?: { street?: string; city?: string; state?: string; postCode?: string; country?: string };
}

export const clientApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getClients: builder.query<ClientListResponse, ClientListParams | void>({
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
        return queryString ? `/clients?${queryString}` : "/clients";
      },
      transformResponse: (response: ApiResponse<ClientListResponse>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.clients.map(({ _id }) => ({ type: "Client" as const, id: _id })),
              { type: "Client", id: "LIST" },
            ]
          : [{ type: "Client", id: "LIST" }],
    }),
    getClientById: builder.query<ClientListItem, string>({
      query: (id) => `/clients/${id}`,
      transformResponse: (response: ApiResponse<{ client: ClientListItem }>) => response.data?.client ?? response.data,
      providesTags: (result, error, id) => [{ type: "Client", id }],
    }),
    getMyClientProfile: builder.query<ClientListItem, void>({
      query: () => `/clients/me`,
      transformResponse: (response: ApiResponse<{ client: ClientListItem }>) => response.data?.client ?? response.data,
      providesTags: [{ type: "Client", id: "ME" }],
    }),
    getMySupportPin: builder.query<SupportPinResponse, void>({
      query: () => `/clients/me/support-pin`,
      transformResponse: (response: ApiResponse<SupportPinResponse>) => response.data,
      keepUnusedDataFor: 300,
    }),
    regenerateMySupportPin: builder.mutation<SupportPinResponse, void>({
      query: () => ({
        url: `/clients/me/support-pin/regenerate`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<SupportPinResponse>) => response.data,
    }),
    verifySupportPin: builder.mutation<SupportPinVerifyResponse, { pin: string }>({
      query: ({ pin }) => ({
        url: `/clients/verify-support-pin`,
        method: "POST",
        body: { pin },
      }),
      transformResponse: (response: ApiResponse<SupportPinVerifyResponse>) => response.data,
    }),
    completeProfile: builder.mutation<{ client: ClientListItem }, CompleteProfileRequest>({
      query: (body) => ({
        url: "/clients/me/complete-profile",
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<{ client: ClientListItem }>) => response.data,
      invalidatesTags: [{ type: "Client", id: "LIST" }],
    }),
    updateClient: builder.mutation<{ client: ClientListItem }, { id: string; data: UpdateClientRequest }>({
      query: ({ id, data }) => ({
        url: `/clients/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ client: ClientListItem }>) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: "Client", id }, { type: "Client", id: "LIST" }],
    }),
    regenerateSupportPinForClient: builder.mutation<SupportPinResponse, { clientId: string }>({
      query: ({ clientId }) => ({
        url: `/clients/${clientId}/support-pin/regenerate`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<SupportPinResponse>) => response.data,
      invalidatesTags: (result, error, { clientId }) => [
        { type: "Client" as const, id: clientId },
        { type: "Client", id: "LIST" },
      ],
      async onQueryStarted({ clientId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            clientApi.util.updateQueryData("getClientById", clientId, (draft) => {
              draft.supportPin = data.supportPin;
            })
          );
        } catch {
          // On error, invalidation will refetch; no need to patch
        }
      },
    }),
  }),
});

export const {
  useGetClientsQuery,
  useGetClientByIdQuery,
  useGetMyClientProfileQuery,
  useGetMySupportPinQuery,
  useRegenerateMySupportPinMutation,
  useVerifySupportPinMutation,
  useRegenerateSupportPinForClientMutation,
  useCompleteProfileMutation,
  useUpdateClientMutation,
} = clientApi;
