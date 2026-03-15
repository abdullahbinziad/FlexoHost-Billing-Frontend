import { api } from "./baseApi";

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
      transformResponse: (res: { data?: GetActivityLogResponse }) =>
        res?.data ?? (res as unknown as GetActivityLogResponse),
      providesTags: ["ActivityLog"],
    }),
  }),
});

export const { useGetActivityLogQuery } = activityLogApi;
