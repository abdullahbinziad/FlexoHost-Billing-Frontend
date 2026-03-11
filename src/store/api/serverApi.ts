import { api } from "./baseApi";
import { ServerConfig, ServerGroup } from "@/types/admin";
import { ApiResponse } from "@/types/api";

export const serverApi = api.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        // Server Config
        getServers: builder.query<ServerConfig[], void>({
            query: () => "/servers",
            transformResponse: (response: ApiResponse<ServerConfig[]>) => response.data,
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "Server" as const, id })),
                        { type: "Server", id: "LIST" },
                    ]
                    : [{ type: "Server", id: "LIST" }],
        }),
        getServer: builder.query<ServerConfig, string>({
            query: (id) => `/servers/${id}`,
            transformResponse: (response: ApiResponse<ServerConfig>) => response.data,
            providesTags: (result, error, id) => [{ type: "Server", id }],
        }),
        addServer: builder.mutation<ServerConfig, Omit<ServerConfig, "id">>({
            query: (data) => ({
                url: "/servers",
                method: "POST",
                body: data,
            }),
            transformResponse: (response: ApiResponse<ServerConfig>) => response.data,
            invalidatesTags: [{ type: "Server", id: "LIST" }],
        }),
        updateServer: builder.mutation<ServerConfig, { id: string; data: Partial<ServerConfig> }>({
            query: ({ id, data }) => ({
                url: `/servers/${id}`,
                method: "PATCH",
                body: data,
            }),
            transformResponse: (response: ApiResponse<ServerConfig>) => response.data,
            invalidatesTags: (result, error, { id }) => [{ type: "Server", id }, { type: "Server", id: "LIST" }],
        }),
        deleteServer: builder.mutation<void, string>({
            query: (id) => ({
                url: `/servers/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [{ type: "Server", id }, { type: "Server", id: "LIST" }],
        }),

        getServerPackages: builder.query<{ packages: { name?: string; [k: string]: unknown }[] }, string>({
            query: (serverId) => `/servers/${serverId}/packages`,
            transformResponse: (response: ApiResponse<{ packages: { name?: string; [k: string]: unknown }[] }>) => ({
                packages: response?.data?.packages ?? [],
            }),
            providesTags: (result, error, serverId) => [{ type: "Server", id: `${serverId}-packages` }],
        }),

        testServerConnection: builder.mutation<{ success: boolean; message?: string; error?: string }, string>({
            query: (serverId) => ({
                url: `/servers/${serverId}/test-connection`,
                method: "POST",
            }),
            transformResponse: (response: ApiResponse<{ success?: boolean; message?: string; error?: string }>) => ({
                success: response?.data?.success ?? false,
                message: response?.data?.message,
                error: response?.data?.error,
            }),
        }),

        // Server Groups
        getServerGroups: builder.query<ServerGroup[], void>({
            query: () => "/server-groups",
            transformResponse: (response: ApiResponse<ServerGroup[]>) => response.data,
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "ServerGroup" as const, id })),
                        { type: "ServerGroup", id: "LIST" },
                    ]
                    : [{ type: "ServerGroup", id: "LIST" }],
        }),
        createServerGroup: builder.mutation<ServerGroup, Omit<ServerGroup, "id">>({
            query: (data) => ({
                url: "/server-groups",
                method: "POST",
                body: data,
            }),
            transformResponse: (response: ApiResponse<ServerGroup>) => response.data,
            invalidatesTags: [{ type: "ServerGroup", id: "LIST" }],
        }),
        updateServerGroup: builder.mutation<ServerGroup, { id: string; data: Partial<ServerGroup> }>({
            query: ({ id, data }) => ({
                url: `/server-groups/${id}`,
                method: "PUT",
                body: data,
            }),
            transformResponse: (response: ApiResponse<ServerGroup>) => response.data,
            invalidatesTags: (result, error, { id }) => [{ type: "ServerGroup", id }, { type: "ServerGroup", id: "LIST" }],
        }),
        deleteServerGroup: builder.mutation<void, string>({
            query: (id) => ({
                url: `/server-groups/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [{ type: "ServerGroup", id }, { type: "ServerGroup", id: "LIST" }],
        }),
    }),
});

export const {
    useGetServersQuery,
    useGetServerQuery,
    useGetServerPackagesQuery,
    useTestServerConnectionMutation,
    useAddServerMutation,
    useUpdateServerMutation,
    useDeleteServerMutation,
    useGetServerGroupsQuery,
    useCreateServerGroupMutation,
    useUpdateServerGroupMutation,
    useDeleteServerGroupMutation,
} = serverApi;
