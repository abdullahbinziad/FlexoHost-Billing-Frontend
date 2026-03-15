import { api } from "./baseApi";

export interface Notification {
  _id: string;
  category: "billing" | "service" | "support" | "security";
  title: string;
  message: string;
  read: boolean;
  readAt?: string;
  linkPath?: string;
  linkLabel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetNotificationsResponse {
  results: Notification[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  unreadCount: number;
}

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      GetNotificationsResponse,
      { page?: number; limit?: number; read?: boolean; category?: string }
    >({
      query: (params) => ({
        url: "/notifications",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          ...(params?.read !== undefined && { read: String(params.read) }),
          ...(params?.category && { category: params.category }),
        },
      }),
      transformResponse: (response: any) => response.data,
      providesTags: (result) =>
        result
          ? [
              "Notification",
              ...result.results.map((n) => ({ type: "Notification" as const, id: n._id })),
            ]
          : ["Notification"],
    }),
    markNotificationRead: builder.mutation<Notification, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, id) => [{ type: "Notification", id }, { type: "Notification" }],
    }),
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "POST",
      }),
      invalidatesTags: ["Notification"],
    }),
    deleteNotification: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Notification", id }, { type: "Notification" }],
    }),
    deleteAllReadNotifications: builder.mutation<{ deletedCount: number }, void>({
      query: () => ({
        url: "/notifications/read/all",
        method: "DELETE",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllReadNotificationsMutation,
} = notificationApi;

