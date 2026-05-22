import { api } from "./baseApi";
import { ApiResponse } from "@/types/api";

export interface AdminUser {
  id?: string;
  _id?: string;
  email: string;
  role: string;
  roleId?: string;
  roleData?: {
    _id: string;
    name: string;
    permissions: string[];
    hasFullAccess?: boolean;
  };
  verified?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsersListResult {
  users: AdminUser[];
  total: number;
  page: number;
  pages: number;
}

export const userApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getUsers: builder.query<
      UsersListResult,
      { page?: number; limit?: number; role?: string }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set("page", String(params.page));
        if (params?.limit) searchParams.set("limit", String(params.limit));
        if (params?.role) searchParams.set("role", params.role);
        const qs = searchParams.toString();
        return `/users${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (response: ApiResponse<UsersListResult>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.users.map((u) => ({
                type: "User" as const,
                id: u.id ?? u._id,
              })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    getUser: builder.query<AdminUser, string>({
      query: (id) => `/users/${id}`,
      transformResponse: (response: ApiResponse<AdminUser>) => response.data,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    updateUser: builder.mutation<
      AdminUser,
      { id: string; data: Partial<{ email: string; role: string; roleId: string; active: boolean; verified: boolean }> }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ApiResponse<AdminUser>) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }, { type: "User", id: "LIST" }],
    }),

    bulkAssignRole: builder.mutation<
      { updated: number },
      { userIds: string[]; roleId: string }
    >({
      query: (body) => ({
        url: "/users/bulk-role",
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<{ updated: number }>) =>
        response.data ?? { updated: 0 },
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "User", id }, { type: "User", id: "LIST" }],
    }),

    permanentlyDeleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}/permanent`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "User", id }, { type: "User", id: "LIST" }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useBulkAssignRoleMutation,
  useDeleteUserMutation,
  usePermanentlyDeleteUserMutation,
} = userApi;
