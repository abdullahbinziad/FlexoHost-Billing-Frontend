import { api } from "./baseApi";
import { ApiResponse } from "@/types/api";
import type { Domain, BulkAction } from "@/types/domain";

export interface GetDomainsResponse {
  domains: Domain[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface DomainListParams {
  page?: number;
  limit?: number;
}

export interface UpdateDomainRequest {
  domainId: string;
  autoRenewal?: boolean;
}

/** Backend expects domain name in path and body.duration (years). */
export interface RenewDomainRequest {
  domainName: string;
  years?: number;
  clientId?: string;
}

export interface DomainScopedRequest {
  domainName: string;
  clientId?: string;
}

export interface DomainContact {
  id?: string;
  organization?: string;
  name?: string;
  email?: string;
  phonecc?: string;
  phonenum?: string;
  faxcc?: string;
  faxnum?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface DomainContactDetails {
  registrant: DomainContact;
  admin: DomainContact;
  tech: DomainContact;
  billing: DomainContact;
}

export interface DomainDnsRecord {
  type: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "SRV" | "forward" | "stealth" | "email";
  name?: string;
  value: string;
  priority?: number;
  ttl?: number;
}

export interface RegistrarConfigField {
  key: string;
  label: string;
  type: "text" | "password" | "checkbox" | "textarea";
  value: string | boolean;
  helperText?: string;
  placeholder?: string;
  hasValue?: boolean;
}

export interface RegistrarConfig {
  key: string;
  name: string;
  logoText?: string;
  description: string;
  implemented: boolean;
  isActive: boolean;
  configFields: RegistrarConfigField[];
  /** Registrar supports listing domains for admin reconcile (e.g. Dynadot); Namely may omit until implemented. */
  supportsRegistrarInventory?: boolean;
}

export interface AdminDomainInventoryItem {
  id: string;
  serviceId: string;
  clientId: string;
  clientNumber?: number;
  clientName: string;
  clientCompanyName?: string;
  clientEmail?: string;
  serviceNumber?: string;
  serviceStatus: string;
  domainName: string;
  registrar: string;
  registrarStatus?: string;
  transferStatus?: string;
  nameservers?: string[];
  registrarLock?: boolean;
  expiresAt?: string;
  registeredAt?: string;
  lastRegistrarSyncAt?: string;
  syncStatus?: string;
  syncMessage?: string;
  syncState?: string;
  source?: string;
  createdAt?: string;
}

export interface GetAdminDomainsParams {
  page?: number;
  limit?: number;
  search?: string;
  registrar?: string;
  serviceStatus?: string;
  transferStatus?: string;
  syncState?: string;
  source?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AdminDomainsResponse {
  results: AdminDomainInventoryItem[];
  totalResults: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BulkSyncDomainsRequest {
  serviceIds?: string[];
  search?: string;
  registrar?: string;
  serviceStatus?: string;
  transferStatus?: string;
  syncState?: string;
  source?: string;
}

export interface BulkSyncDomainsResponse {
  total: number;
  synced: number;
  failed: number;
  items: Array<{ serviceId: string; success: boolean; message?: string }>;
}

export interface ReconcileRegistrarDomainsResponse {
  registrar: string;
  totalDomains: number;
  knownCount: number;
  missingDomains: Array<{
    domainName: string;
    registrar: string;
    alreadyImported: boolean;
  }>;
}

export interface ImportRegistrarDomainsResponse {
  registrar: string;
  importedCount: number;
  importedDomains: Array<{
    domainName: string;
    status: string;
  }>;
}

/** Global domain defaults (Mongo-backed; replaces env DOMAIN_DEFAULT_*). */
export interface DomainSystemSettingsDto {
  defaultRegistrarKey: string;
  nameserver1: string;
  nameserver2: string;
  nameserver3: string;
  nameserver4: string;
}

function withClientId(clientId?: string) {
  return clientId ? { clientId } : undefined;
}

/** Map backend domain list item to Domain. */
function mapDomainFromApi(item: {
  serviceId?: string;
  serviceNumber?: string;
  status?: string;
  domainName?: string;
  registrar?: string;
  expiresAt?: string | Date;
  nameservers?: string[];
  registrarLock?: boolean;
  hasEppCode?: boolean;
  details?: { domainName?: string; registrar?: string; registeredAt?: string; transferStatus?: string };
}): Domain {
  const name =
    (item.domainName && String(item.domainName).trim()) ||
    (item.details?.domainName && String(item.details.domainName).trim()) ||
    "";
  const status = (item.status?.toLowerCase() ?? "active") as Domain["status"];
  const expiresAt = item.expiresAt ? (typeof item.expiresAt === "string" ? item.expiresAt : new Date(item.expiresAt).toISOString().slice(0, 10)) : "";
  return {
    id: item.serviceId ?? name,
    name,
    serviceNumber: item.serviceNumber,
    status: ["active", "expired", "pending", "suspended"].includes(status) ? status : "active",
    expirationDate: expiresAt,
    autoRenewal: true,
    registrationDate: item.details?.registeredAt ? (typeof item.details.registeredAt === "string" ? item.details.registeredAt.slice(0, 10) : "") : "",
    registrar: item.registrar ?? item.details?.registrar,
    transferStatus: item.details?.transferStatus,
    registrarLock: item.registrarLock,
    serviceId: item.serviceId,
    domainName: item.domainName,
    hasEppCode: item.hasEppCode,
    nameservers: item.nameservers,
  };
}

export const domainApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDomains: builder.query<GetDomainsResponse, DomainListParams | void>({
      query: (params) => ({
        url: "/domains",
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<{ domains: unknown[]; total: number; page?: number; limit?: number; totalPages?: number }>) => {
        const data = response.data;
        const domains = (data?.domains ?? []).map((d) => mapDomainFromApi(d as Parameters<typeof mapDomainFromApi>[0]));
        return {
          domains,
          total: data?.total ?? 0,
          page: data?.page ?? 1,
          limit: data?.limit ?? domains.length,
          totalPages: data?.totalPages ?? 1,
        };
      },
      providesTags: ["Domain"],
    }),
    getDomainsByClient: builder.query<GetDomainsResponse, { clientId: string; page?: number; limit?: number }>({
      query: ({ clientId, page, limit }) => ({
        url: `/domains/admin/client/${clientId}`,
        params: {
          ...(page != null ? { page } : {}),
          ...(limit != null ? { limit } : {}),
        },
      }),
      transformResponse: (response: ApiResponse<{ domains: unknown[]; total: number; page?: number; limit?: number; totalPages?: number }>) => {
        const data = response.data;
        const domains = (data?.domains ?? []).map((d) => mapDomainFromApi(d as Parameters<typeof mapDomainFromApi>[0]));
        return {
          domains,
          total: data?.total ?? 0,
          page: data?.page ?? 1,
          limit: data?.limit ?? domains.length,
          totalPages: data?.totalPages ?? 1,
        };
      },
      providesTags: (_result, _err, { clientId }) => [{ type: "Domain", id: `CLIENT-${clientId}` }],
    }),
    getDomainSystemDefaults: builder.query<DomainSystemSettingsDto, void>({
      query: () => "/domains/admin/system-defaults",
      transformResponse: (response: ApiResponse<DomainSystemSettingsDto>) =>
        response.data ?? {
          defaultRegistrarKey: "dynadot",
          nameserver1: "",
          nameserver2: "",
          nameserver3: "",
          nameserver4: "",
        },
      providesTags: [{ type: "Domain", id: "SYSTEM-DEFAULTS" }],
    }),
    updateDomainSystemDefaults: builder.mutation<DomainSystemSettingsDto, Partial<DomainSystemSettingsDto>>({
      query: (body) => ({
        url: "/domains/admin/system-defaults",
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<DomainSystemSettingsDto>) =>
        response.data ?? {
          defaultRegistrarKey: "dynadot",
          nameserver1: "",
          nameserver2: "",
          nameserver3: "",
          nameserver4: "",
        },
      invalidatesTags: [{ type: "Domain", id: "SYSTEM-DEFAULTS" }],
    }),
    getAdminRegistrarConfigs: builder.query<RegistrarConfig[], void>({
      query: () => ({
        url: "/domains/admin/registrars",
      }),
      transformResponse: (response: unknown): RegistrarConfig[] => {
        if (Array.isArray(response)) {
          return response as RegistrarConfig[];
        }
        if (response && typeof response === "object" && "data" in response) {
          const inner = (response as { data?: unknown }).data;
          if (Array.isArray(inner)) {
            return inner as RegistrarConfig[];
          }
        }
        return [];
      },
      providesTags: [{ type: "Domain", id: "REGISTRARS" }],
    }),
    getAdminDomains: builder.query<AdminDomainsResponse, GetAdminDomainsParams | void>({
      query: (params) => ({
        url: "/domains/admin/inventory",
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<AdminDomainsResponse>) =>
        response.data ?? { results: [], totalResults: 0, page: 1, limit: 20, totalPages: 1 },
      providesTags: [{ type: "Domain", id: "ADMIN-INVENTORY" }],
    }),
    syncAdminDomain: builder.mutation<
      { serviceId: string; domainName: string; registrar: string; registrarStatus?: string; expiresAt?: string; lastRegistrarSyncAt?: string },
      { serviceId: string }
    >({
      query: ({ serviceId }) => ({
        url: `/domains/admin/${serviceId}/sync`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<{ serviceId: string; domainName: string; registrar: string; registrarStatus?: string; expiresAt?: string; lastRegistrarSyncAt?: string }>) =>
        response.data as { serviceId: string; domainName: string; registrar: string; registrarStatus?: string; expiresAt?: string; lastRegistrarSyncAt?: string },
      invalidatesTags: (_result, _err, { serviceId }) => [
        { type: "Domain", id: "ADMIN-INVENTORY" },
        { type: "Domain", id: serviceId },
      ],
    }),
    bulkSyncAdminDomains: builder.mutation<BulkSyncDomainsResponse, BulkSyncDomainsRequest>({
      query: (body) => ({
        url: "/domains/admin/sync",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<BulkSyncDomainsResponse>) =>
        response.data ?? { total: 0, synced: 0, failed: 0, items: [] },
      invalidatesTags: [{ type: "Domain", id: "ADMIN-INVENTORY" }],
    }),
    reconcileAdminRegistrarDomains: builder.mutation<ReconcileRegistrarDomainsResponse, { registrarKey: string }>({
      query: ({ registrarKey }) => ({
        url: `/domains/admin/reconcile/${registrarKey}`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<ReconcileRegistrarDomainsResponse>) =>
        response.data ?? { registrar: "", totalDomains: 0, knownCount: 0, missingDomains: [] },
    }),
    importAdminRegistrarDomains: builder.mutation<ImportRegistrarDomainsResponse, { registrarKey: string; domains: string[] }>({
      query: ({ registrarKey, domains }) => ({
        url: `/domains/admin/reconcile/${registrarKey}/import`,
        method: "POST",
        body: { domains },
      }),
      transformResponse: (response: ApiResponse<ImportRegistrarDomainsResponse>) =>
        response.data ?? { registrar: "", importedCount: 0, importedDomains: [] },
      invalidatesTags: [{ type: "Domain", id: "ADMIN-INVENTORY" }],
    }),
    updateAdminRegistrarConfig: builder.mutation<
      RegistrarConfig,
      { registrarKey: string; isActive?: boolean; settings?: Record<string, string | boolean | null> }
    >({
      query: ({ registrarKey, ...body }) => ({
        url: `/domains/admin/registrars/${registrarKey}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<RegistrarConfig>) => response.data as RegistrarConfig,
      invalidatesTags: (_result, _err, { registrarKey }) => [
        { type: "Domain", id: "REGISTRARS" },
        { type: "Domain", id: `REGISTRAR-${registrarKey}` },
      ],
    }),

    getEppCode: builder.query<{ eppCode: string }, string>({
      query: (domainName) => `/domains/${encodeURIComponent(domainName)}/epp`,
      transformResponse: (response: ApiResponse<{ eppCode: string }>) => response.data ?? { eppCode: "" },
      providesTags: (_result, _err, domainName) => [{ type: "Domain", id: `EPP-${domainName}` }],
    }),
    getAdminEppCode: builder.query<{ eppCode: string }, DomainScopedRequest>({
      query: ({ domainName, clientId }) => ({
        url: `/domains/${encodeURIComponent(domainName)}/epp`,
        params: withClientId(clientId),
      }),
      transformResponse: (response: ApiResponse<{ eppCode: string }>) => response.data ?? { eppCode: "" },
      providesTags: (_result, _err, { domainName }) => [{ type: "Domain", id: `EPP-${domainName}` }],
    }),

    getDomainDetails: builder.query<
      { domain: string; status: string; expirationDate: string; nameservers: string[]; locked?: boolean },
      string
    >({
      query: (domainName) => `/domains/${encodeURIComponent(domainName)}`,
      transformResponse: (response: ApiResponse<{ domain: string; status: string; expirationDate: string; nameservers: string[]; locked?: boolean }>) =>
        response.data ?? { domain: "", status: "", expirationDate: "", nameservers: [] },
      providesTags: (_result, _err, domainName) => [{ type: "Domain", id: domainName }],
    }),
    getAdminDomainDetails: builder.query<
      { domain: string; status: string; expirationDate: string; nameservers: string[]; locked?: boolean; autoRenew?: boolean; registrar?: string },
      DomainScopedRequest
    >({
      query: ({ domainName, clientId }) => ({
        url: `/domains/${encodeURIComponent(domainName)}`,
        params: withClientId(clientId),
      }),
      transformResponse: (response: ApiResponse<{ domain: string; status: string; expirationDate: string; nameservers: string[]; locked?: boolean; autoRenew?: boolean; registrar?: string }>) =>
        response.data ?? { domain: "", status: "", expirationDate: "", nameservers: [], locked: false, autoRenew: false, registrar: "" },
      providesTags: (_result, _err, { domainName }) => [{ type: "Domain", id: domainName }],
    }),
    getAdminDomainContacts: builder.query<DomainContactDetails, DomainScopedRequest>({
      query: ({ domainName, clientId }) => ({
        url: `/domains/${encodeURIComponent(domainName)}/contacts`,
        params: withClientId(clientId),
      }),
      transformResponse: (response: ApiResponse<DomainContactDetails>) =>
        response.data ?? { registrant: {}, admin: {}, tech: {}, billing: {} },
      providesTags: (_result, _err, { domainName }) => [{ type: "Domain", id: `CONTACTS-${domainName}` }],
    }),
    updateAdminDomainContacts: builder.mutation<void, { domainName: string; clientId?: string; contacts: Partial<DomainContactDetails> }>({
      query: ({ domainName, clientId, contacts }) => ({
        url: `/domains/${encodeURIComponent(domainName)}/contacts`,
        method: "PUT",
        params: withClientId(clientId),
        body: { contacts },
      }),
      invalidatesTags: (_result, _err, { domainName, clientId }) => [
        { type: "Domain", id: `CONTACTS-${domainName}` },
        { type: "Domain", id: domainName },
        ...(clientId ? [{ type: "Domain" as const, id: `CLIENT-${clientId}` }] : []),
      ],
    }),
    getAdminDomainDns: builder.query<DomainDnsRecord[], DomainScopedRequest>({
      query: ({ domainName, clientId }) => ({
        url: `/domains/${encodeURIComponent(domainName)}/dns`,
        params: withClientId(clientId),
      }),
      transformResponse: (response: ApiResponse<{ records: DomainDnsRecord[] }>) => response.data?.records ?? [],
      providesTags: (_result, _err, { domainName }) => [{ type: "Domain", id: `DNS-${domainName}` }],
    }),
    updateAdminDomainDns: builder.mutation<void, { domainName: string; clientId?: string; records: DomainDnsRecord[] }>({
      query: ({ domainName, clientId, records }) => ({
        url: `/domains/${encodeURIComponent(domainName)}/dns`,
        method: "PUT",
        params: withClientId(clientId),
        body: { records },
      }),
      invalidatesTags: (_result, _err, { domainName, clientId }) => [
        { type: "Domain", id: `DNS-${domainName}` },
        ...(clientId ? [{ type: "Domain" as const, id: `CLIENT-${clientId}` }] : []),
      ],
    }),
    updateAdminDomainRegistrarLock: builder.mutation<void, { domainName: string; clientId?: string; locked: boolean }>({
      query: ({ domainName, clientId, locked }) => ({
        url: `/domains/${encodeURIComponent(domainName)}/lock`,
        method: "PUT",
        params: withClientId(clientId),
        body: { locked },
      }),
      invalidatesTags: (_result, _err, { domainName, clientId }) => [
        { type: "Domain", id: domainName },
        ...(clientId ? [{ type: "Domain" as const, id: `CLIENT-${clientId}` }] : []),
      ],
    }),

    updateNameservers: builder.mutation<void, { domainName: string; nameservers: string[] }>({
      query: ({ domainName, nameservers }) => ({
        url: `/domains/${encodeURIComponent(domainName)}/nameservers`,
        method: "PUT",
        body: { nameservers },
      }),
      invalidatesTags: ["Domain"],
    }),
    updateAdminNameservers: builder.mutation<void, { domainName: string; clientId?: string; nameservers: string[] }>({
      query: ({ domainName, clientId, nameservers }) => ({
        url: `/domains/${encodeURIComponent(domainName)}/nameservers`,
        method: "PUT",
        params: withClientId(clientId),
        body: { nameservers },
      }),
      invalidatesTags: (_result, _err, { domainName, clientId }) => [
        { type: "Domain", id: domainName },
        ...(clientId ? [{ type: "Domain" as const, id: `CLIENT-${clientId}` }] : []),
      ],
    }),

    updateDomain: builder.mutation<Domain, UpdateDomainRequest>({
      query: ({ domainId, ...data }) => ({
        url: `/domains/${domainId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Domain"],
    }),

    renewDomain: builder.mutation<{ success: boolean; message: string }, RenewDomainRequest>({
      query: (data) => ({
        url: `/domains/${encodeURIComponent(data.domainName)}/renew`,
        method: "POST",
        params: withClientId(data.clientId),
        body: { duration: data.years ?? 1 },
      }),
      invalidatesTags: ["Domain"],
    }),

    // Bulk actions
    bulkAction: builder.mutation<{ success: boolean; message: string }, BulkAction>({
      query: (data) => ({
        url: "/domains/bulk-action",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Domain"],
    }),

    // Delete domain
    deleteDomain: builder.mutation<{ success: boolean }, string>({
      query: (domainId) => ({
        url: `/domains/${domainId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Domain"],
    }),
  }),
});

export const {
  useGetDomainsQuery,
  useGetDomainsByClientQuery,
  useGetDomainSystemDefaultsQuery,
  useUpdateDomainSystemDefaultsMutation,
  useGetAdminRegistrarConfigsQuery,
  useGetAdminDomainsQuery,
  useSyncAdminDomainMutation,
  useBulkSyncAdminDomainsMutation,
  useReconcileAdminRegistrarDomainsMutation,
  useImportAdminRegistrarDomainsMutation,
  useUpdateAdminRegistrarConfigMutation,
  useGetEppCodeQuery,
  useLazyGetAdminEppCodeQuery,
  useLazyGetEppCodeQuery,
  useGetDomainDetailsQuery,
  useGetAdminDomainDetailsQuery,
  useGetAdminDomainContactsQuery,
  useUpdateAdminDomainContactsMutation,
  useGetAdminDomainDnsQuery,
  useUpdateAdminDomainDnsMutation,
  useUpdateAdminDomainRegistrarLockMutation,
  useUpdateNameserversMutation,
  useUpdateAdminNameserversMutation,
  useUpdateDomainMutation,
  useRenewDomainMutation,
  useBulkActionMutation,
  useDeleteDomainMutation,
} = domainApi;
