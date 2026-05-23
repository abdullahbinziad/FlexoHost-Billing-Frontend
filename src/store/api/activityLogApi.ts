import { api } from "./baseApi";
import type { ApiResponse } from "@/types/api";

export interface ActivityLogEntry {
  _id: string;
  message: string;
  type?: string;
  category?: string;
  actorType: "system" | "user";
  userId?: string | { _id: string; email?: string };
  actorId?: string | { _id: string; email?: string };
  targetType?: string;
  targetId?: string;
  source?: string;
  status?: string;
  severity?: string;
  clientId?: string | { _id: string; firstName?: string; lastName?: string; contactEmail?: string };
  serviceId?: string;
  invoiceId?: string;
  domainId?: string;
  ticketId?: string;
  orderId?: string;
  ipAddress?: string;
  userAgent?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface GetActivityLogParams {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: string;
  actorType?: "system" | "user";
  category?: string;
  type?: string;
  source?: string;
  severity?: string;
  invoiceId?: string;
  serviceId?: string;
  ticketId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface GetActivityLogResponse {
  results: ActivityLogEntry[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export const activityLogApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getActivityLog: builder.query<GetActivityLogResponse, GetActivityLogParams | void>({
      query: (params) => ({
        url: "/activity-log",
        params: params || {},
      }),
      transformResponse: (response: ApiResponse<GetActivityLogResponse>) =>
        response.data ??
        ({
          results: [],
          page: 1,
          limit: 20,
          totalPages: 0,
          totalResults: 0,
        } satisfies GetActivityLogResponse),
      providesTags: ["ActivityLog"],
    }),
  }),
});

export const { useGetActivityLogQuery } = activityLogApi;
