import { api } from "./baseApi";
import { ApiResponse } from "@/types/api";

export interface Role {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  permissions: string[];
  description?: string;
  isSystem: boolean;
  hasFullAccess: boolean;
  archived?: boolean;
  archivedAt?: string;
  archivedBy?: string;
  userCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionMeta {
  id: string;
  label: string;
  description?: string;
  category: string;
  riskLevel?: string;
}

/** Permissions grouped by resource (e.g. { dashboard: [...], clients: [...] }) */
export type PermissionsByResource = Record<string, PermissionMeta[]>;

export interface RolePreset {
  id?: string;
  name: string;
  slug?: string;
  permissions: string[];
  description?: string;
}

export interface RolesListResult {
  roles: Role[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface RoleCompareResult {
  role1: Role;
  role2: Role;
  diff: {
    onlyInRole1: string[];
    onlyInRole2: string[];
    inBoth: string[];
  };
}

export interface RoleExportData {
  name: string;
  slug: string;
  permissions: string[];
  description?: string;
}

export const roleApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getRoles: builder.query<RolesListResult, { page?: number; limit?: number; includeArchived?: boolean; search?: string } | void>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set("page", String(params.page));
        if (params?.limit) searchParams.set("limit", String(params.limit));
        if (params?.includeArchived) searchParams.set("includeArchived", "true");
        if (params?.search) searchParams.set("search", params.search);
        const qs = searchParams.toString();
        return `/roles${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (response: ApiResponse<RolesListResult>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.roles.map((r) => ({ type: "Role" as const, id: r.id || r._id })),
              { type: "Role", id: "LIST" },
            ]
          : [{ type: "Role", id: "LIST" }],
    }),

    getRole: builder.query<Role, string>({
      query: (id) => `/roles/${id}`,
      transformResponse: (response: ApiResponse<Role>) => response.data,
      providesTags: (result, error, id) => [{ type: "Role", id }],
    }),

    getPermissions: builder.query<PermissionsByResource, void>({
      query: () => "/roles/permissions",
      transformResponse: (response: ApiResponse<PermissionsByResource>) => response.data ?? {},
      providesTags: [{ type: "Role", id: "PERMISSIONS" }],
    }),

    getPresets: builder.query<RolePreset[], void>({
      query: () => "/roles/presets",
      transformResponse: (response: ApiResponse<RolePreset[]>) => response.data ?? [],
      providesTags: [{ type: "Role", id: "PRESETS" }],
    }),

    compareRoles: builder.query<RoleCompareResult, { id1: string; id2: string }>({
      query: ({ id1, id2 }) => `/roles/compare?id1=${id1}&id2=${id2}`,
      transformResponse: (response: ApiResponse<RoleCompareResult>) => response.data,
    }),

    createRole: builder.mutation<Role, { name: string; slug?: string; permissions: string[]; description?: string }>({
      query: (data) => ({
        url: "/roles",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Role>) => response.data,
      invalidatesTags: [{ type: "Role", id: "LIST" }],
    }),

    updateRole: builder.mutation<Role, { id: string; data: { name?: string; permissions?: string[]; description?: string } }>({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Role>) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: "Role", id }, { type: "Role", id: "LIST" }],
    }),

    deleteRole: builder.mutation<void, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Role", id }, { type: "Role", id: "LIST" }],
    }),

    archiveRole: builder.mutation<Role, string>({
      query: (id) => ({
        url: `/roles/${id}/archive`,
        method: "PATCH",
      }),
      transformResponse: (response: ApiResponse<Role>) => response.data,
      invalidatesTags: (result, error, id) => [{ type: "Role", id }, { type: "Role", id: "LIST" }],
    }),

    restoreRole: builder.mutation<Role, string>({
      query: (id) => ({
        url: `/roles/${id}/restore`,
        method: "PATCH",
      }),
      transformResponse: (response: ApiResponse<Role>) => response.data,
      invalidatesTags: (result, error, id) => [{ type: "Role", id }, { type: "Role", id: "LIST" }],
    }),

    duplicateRole: builder.mutation<Role, string>({
      query: (id) => ({
        url: `/roles/${id}/duplicate`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<Role>) => response.data,
      invalidatesTags: [{ type: "Role", id: "LIST" }],
    }),

    exportRole: builder.query<RoleExportData, string>({
      query: (id) => `/roles/${id}/export`,
      transformResponse: (response: ApiResponse<RoleExportData>) => response.data,
    }),

    importRole: builder.mutation<Role, RoleExportData>({
      query: (data) => ({
        url: "/roles/import",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Role>) => response.data,
      invalidatesTags: [{ type: "Role", id: "LIST" }],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleQuery,
  useGetPermissionsQuery,
  useGetPresetsQuery,
  useCompareRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useArchiveRoleMutation,
  useRestoreRoleMutation,
  useDuplicateRoleMutation,
  useLazyExportRoleQuery,
  useImportRoleMutation,
} = roleApi;
