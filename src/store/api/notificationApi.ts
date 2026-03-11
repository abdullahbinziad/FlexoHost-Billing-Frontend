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
    getNotifications: builder.query<GetNotificationsResponse, { page?: number; limit?: number }>({
      query: (params) => ({
        url: "/notifications",
        params,
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ["Notification"],
    }),
    markNotificationRead: builder.mutation<Notification, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["Notification"],
    }),
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "POST",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;

