import { api } from "./baseApi";
import { ApiResponse } from "@/types/api";

export interface ClientListParams {
  page?: number;
  limit?: number;
  firstName?: string;
  lastName?: string;
  companyName?: string;
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
  createdAt: string;
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
  }),
});

export const { useGetClientsQuery, useGetClientByIdQuery } = clientApi;
