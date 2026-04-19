import { api } from "./baseApi";
import { ApiResponse } from "@/types/api";
import type { HostingService } from "@/types/hosting";
import type { HostingServiceDetails } from "@/types/hosting-manage";
import {
  SERVICE_STATUS,
  normalizeServiceStatus,
  toHostingServiceStatus,
} from "@/constants/serviceStatus";

/** Backend service list item (enriched with displayName, identifier, serverLocation) */
export interface ClientServiceApiItem {
  _id: string;
  type: string;
  status: string;
  billingCycle: string;
  currency: string;
  priceSnapshot: { recurring: number; total: number; currency: string };
  nextDueDate: string;
  displayName?: string;
  identifier?: string;
  serverLocation?: string;
  orderItemId?: string;
  /** ISO date string - when the service was suspended (admin tracking) */
  suspendedAt?: string;
  /** ISO date string - when the service was terminated (admin tracking) */
  terminatedAt?: string;
  /** ISO date string - when the service was cancelled before activation */
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
  graceUntil?: string;
  meta?: {
    autoSuspendAt?: string | null;
    autoTerminateAt?: string | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface ClientServicesListResponse {
  services: ClientServiceApiItem[];
  total: number;
  pages: number;
}

/** Backend getServiceWithDetails response */
export interface ClientServiceWithDetailsResponse {
  service: ClientServiceApiItem & { orderId?: string; orderItemId?: string };
  details: {
    primaryDomain?: string;
    domainName?: string;
    serverLocation?: string;
    resourceLimits?: { diskMb: number; bandwidthMb: number };
    [key: string]: unknown;
  } | null;
}

function mapStatus(status: string): HostingService["status"] {
  return toHostingServiceStatus(normalizeServiceStatus(status));
}

function formatDate(d: string | Date): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

function mapProductType(type: string | undefined): HostingService["productType"] {
  const normalized = String(type || "").trim().toUpperCase();

  if (normalized === "VPS") return "vps";
  if (normalized === "DOMAIN") return "domain";
  if (normalized === "EMAIL") return "email";
  if (normalized === "LICENSE") return "license";
  if (normalized === "DEDICATED") return "dedicated";

  return "hosting";
}

/** Map backend list item to HostingService for /hosting page */
export function mapServiceToHostingService(s: ClientServiceApiItem): HostingService {
  const nextDue = s.nextDueDate ? new Date(s.nextDueDate) : null;
  const now = new Date();
  const normalizedStatus = normalizeServiceStatus(s.status, {
    suspendedAt: s.suspendedAt,
    terminatedAt: s.terminatedAt,
    cancelledAt: s.cancelledAt,
  });
  const statusMapped = toHostingServiceStatus(normalizedStatus);
  const rawStatus = String(s.status || "").trim().toUpperCase();
  const hasProvisioningIssue = Boolean(
    (s as any)?.provisioning?.lastError ||
      (s as any)?.provisioningError ||
      (s as any)?.meta?.provisioningLastError
  );
  const pendingReason: HostingService["pendingReason"] | undefined =
    normalizedStatus === SERVICE_STATUS.PROVISIONING ||
    normalizedStatus === SERVICE_STATUS.FAILED ||
    rawStatus === SERVICE_STATUS.FAILED ||
    hasProvisioningIssue
      ? "provisioning"
      : normalizedStatus === SERVICE_STATUS.PENDING
        ? "unpaid_invoice"
        : undefined;
  const expiredDaysAgo =
    nextDue && nextDue < now && (statusMapped === "terminated" || statusMapped === "expired")
      ? Math.floor((now.getTime() - nextDue.getTime()) / (24 * 60 * 60 * 1000))
      : undefined;

  return {
    id: s._id,
    name: s.displayName || "Hosting",
    identifier: s.identifier || "—",
    status: statusMapped,
    ...(expiredDaysAgo !== undefined && { expiredDaysAgo }),
    expirationDate: formatDate(s.nextDueDate),
    nextDueDate: formatDate(s.nextDueDate),
    renewalDate: formatDate(s.nextDueDate),
    suspendedAt: s.suspendedAt ? (typeof s.suspendedAt === "string" ? s.suspendedAt : new Date(s.suspendedAt).toISOString()) : undefined,
    terminatedAt: s.terminatedAt ? (typeof s.terminatedAt === "string" ? s.terminatedAt : new Date(s.terminatedAt).toISOString()) : undefined,
    cancelledAt: s.cancelledAt
      ? typeof s.cancelledAt === "string"
        ? s.cancelledAt
        : new Date(s.cancelledAt).toISOString()
      : undefined,
    createdAt: (s.meta?.trackingCreatedAt as string | undefined) || (s.createdAt ? (typeof s.createdAt === "string" ? s.createdAt : new Date(s.createdAt).toISOString()) : undefined),
    updatedAt: (s.meta?.trackingUpdatedAt as string | undefined) || (s.updatedAt ? (typeof s.updatedAt === "string" ? s.updatedAt : new Date(s.updatedAt).toISOString()) : undefined),
    graceUntil: s.graceUntil ? (typeof s.graceUntil === "string" ? s.graceUntil : new Date(s.graceUntil).toISOString()) : undefined,
    autoSuspendAt: s.meta?.autoSuspendAt ?? undefined,
    autoTerminateAt: s.meta?.autoTerminateAt ?? undefined,
    pricing: {
      amount: s.priceSnapshot?.recurring ?? s.priceSnapshot?.total ?? 0,
      currency: s.currency || "BDT",
      billingCycle: (s.billingCycle || "annually") as HostingService["pricing"]["billingCycle"],
    },
    productType: mapProductType(s.type),
    serverLocation: s.serverLocation,
    pendingReason,
  };
}

/** Map backend service + details to HostingServiceDetails for /hosting/[id] manage page */
export function mapServiceWithDetailsToHostingDetails(
  res: ClientServiceWithDetailsResponse
): HostingServiceDetails {
  const svc = res.service;
  const details = res.details || {};
  const base = mapServiceToHostingService(svc);

  const diskMb = details.resourceLimits?.diskMb ?? 0;
  const bandwidthMb = details.resourceLimits?.bandwidthMb ?? 0;

  const orderedLoc = (svc as { meta?: { orderedServerLocation?: string } }).meta?.orderedServerLocation;

  return {
    ...base,
    serverLocation: details.serverLocation ?? orderedLoc ?? base.serverLocation,
    domain:
      details.primaryDomain ||
      details.domainName ||
      (base.identifier && base.identifier !== "—" ? base.identifier : "—"),
    rawStatus: svc.status,
    packageName: ((svc as any).meta?.adminPackageName as string) || base.name,
    packageProductId: ((svc as any).meta?.adminPackageProductId as string) || undefined,
    usage: {
      disk: {
        used: 0,
        total: diskMb,
        lastUpdated: new Date().toISOString(),
      },
      bandwidth: {
        used: 0,
        total: bandwidthMb || "unlimited",
        lastUpdated: new Date().toISOString(),
      },
    },
    billing: {
      firstPaymentAmount: Number((svc as any).meta?.adminBillingFirstPaymentAmount ?? svc.priceSnapshot?.total ?? base.pricing.amount),
      recurringAmount: base.pricing.amount,
      billingCycle: base.pricing.billingCycle.charAt(0).toUpperCase() + base.pricing.billingCycle.slice(1),
      paymentMethod: String((svc as any).meta?.adminBillingPaymentMethod ?? "—"),
      registrationDate: formatDate(((svc as any).meta?.adminBillingRegistrationDate as string) || (svc as any).createdAt) || "—",
      nextDueDate: base.nextDueDate ?? "—",
      currency: base.pricing.currency,
    },
    adminNotes: (svc as any).meta?.adminNotes ?? "",
    moduleContext: {
      accountUsername: (details as any)?.accountUsername || ((svc as any).meta?.lastModuleUsername as string) || undefined,
      serverId: ((details as any)?.serverId ? String((details as any).serverId) : undefined) || ((svc as any).meta?.lastModuleServerId as string) || undefined,
      serverGroup: ((svc as any).meta?.lastModuleServerGroup as string) || undefined,
      serverLocation:
        (details as any)?.serverLocation ||
        ((svc as any).meta?.orderedServerLocation as string) ||
        ((svc as any).meta?.lastModuleServerLocation as string) ||
        base.serverLocation ||
        undefined,
      whmPackage:
        ((svc as any).meta?.lastModuleWhmPackage as string) ||
        ((svc as any).meta?.orderedWhmPackage as string) ||
        ((details as any)?.packageId ? String((details as any).packageId) : undefined) ||
        undefined,
      hasSavedPassword: Boolean((svc as any).meta?.lastModulePasswordEncrypted),
      lastPasswordUpdatedAt: ((svc as any).meta?.lastModulePasswordUpdatedAt as string) || undefined,
      lastUsedAt: ((svc as any).meta?.lastModuleUsedAt as string) || undefined,
    },
  };
}

export interface GetClientServicesParams {
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export type AutomationTaskKey =
  | "renewals"
  | "billable-items-recurring"
  | "overdue-suspensions"
  | "invoice-reminders"
  | "terminations"
  | "usage-sync"
  | "action-worker"
  | "provisioning-worker"
  | "domain-sync"
  | "digest-email";

export type AutomationRunStatus = "running" | "success" | "failure";
export type AutomationRunSource = "cron" | "manual";

export interface AutomationRunItem {
  id: string;
  taskKey: AutomationTaskKey;
  taskLabel: string;
  category: string;
  source: AutomationRunSource;
  status: AutomationRunStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  errorMessage?: string;
  result?: Record<string, unknown>;
}

export interface AutomationTaskSummary {
  key: AutomationTaskKey;
  label: string;
  category: string;
  description: string;
  intervalMs: number;
  runOnStart: boolean;
  successCount24h: number;
  failureCount24h: number;
  runningCount: number;
  consecutiveFailures: number;
  alertOpen: boolean;
  lastRun: {
    id: string;
    status: AutomationRunStatus;
    source: AutomationRunSource;
    startedAt: string;
    completedAt?: string;
    durationMs?: number;
    errorMessage?: string;
    result?: Record<string, unknown>;
  } | null;
}

export interface AutomationSummaryResponse {
  cronEnabled: boolean;
  alertsEnabled: boolean;
  alertThreshold: number;
  alertChannels: {
    email: boolean;
    webhook: boolean;
  };
  tasks: AutomationTaskSummary[];
  totals: {
    tasks: number;
    running: number;
    healthy: number;
    failures24h: number;
    successes24h: number;
  };
}

export interface AutomationRunsResponse {
  results: AutomationRunItem[];
  page: number;
  limit: number;
  totalResults: number;
  totalPages: number;
}

export const servicesApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getClientServices: builder.query<
      { services: HostingService[]; total: number; pages: number },
      { clientId: string; params?: GetClientServicesParams }
    >({
      query: ({ clientId, params }) => {
        const search = new URLSearchParams();
        if (params?.type) search.set("type", params.type);
        if (params?.status) search.set("status", params.status);
        if (params?.page != null) search.set("page", String(params.page));
        if (params?.limit != null) search.set("limit", String(params.limit));
        const q = search.toString();
        return `/services/client/${clientId}${q ? `?${q}` : ""}`;
      },
      transformResponse: (response: ApiResponse<ClientServicesListResponse>) => {
        const data = response.data;
        if (!data) return { services: [], total: 0, pages: 0 };
        return {
          services: data.services.map(mapServiceToHostingService),
          total: data.total,
          pages: data.pages,
        };
      },
      providesTags: (result, _err, { clientId }) =>
        result
          ? [
              ...result.services.map((s) => ({ type: "Service" as const, id: s.id })),
              { type: "Service", id: `LIST-${clientId}` },
            ]
          : [{ type: "Service", id: `LIST-${clientId}` }],
    }),
    getClientServiceById: builder.query<HostingServiceDetails | null, { clientId: string; serviceId: string }>({
      query: ({ clientId, serviceId }) => `/services/client/${clientId}/${serviceId}`,
      transformResponse: (response: ApiResponse<ClientServiceWithDetailsResponse> | null) => {
        if (!response?.data) return null;
        return mapServiceWithDetailsToHostingDetails(response.data);
      },
      providesTags: (_result, _err, { serviceId }) => [{ type: "Service", id: serviceId }],
    }),

    /** Available cPanel shortcuts for this hosting service (from WHM get_users_links). */
    getCpanelShortcuts: builder.query<
      { shortcuts: Array<{ key: string; label: string }> },
      { clientId: string; serviceId: string }
    >({
      query: ({ clientId, serviceId }) =>
        `/services/client/${clientId}/${serviceId}/cpanel/shortcuts`,
      transformResponse: (response: { success?: boolean; shortcuts?: Array<{ key: string; label: string }> }) => ({
        shortcuts: response.shortcuts ?? [],
      }),
      providesTags: (_result, _err, { serviceId }) => [{ type: "Service", id: `${serviceId}-shortcuts` }],
    }),
    /** Create an email mailbox for this hosting service (cPanel). */
    createHostingEmailAccount: builder.mutation<
      { email: string },
      { clientId: string; serviceId: string; email: string; password: string }
    >({
      query: ({ clientId, serviceId, email, password }) => ({
        url: `/services/client/${clientId}/${serviceId}/email/accounts`,
        method: "POST",
        body: { email, password },
      }),
      transformResponse: (response: { success?: boolean; email?: string }) => ({
        email: response.email ?? "",
      }),
    }),
    /** One-click login URL for a shortcut. Backend verifies appkey in get_users_links before create_user_session. */
    getShortcutLoginUrl: builder.query<
      { url: string },
      { clientId: string; serviceId: string; shortcutKey: string }
    >({
      query: ({ clientId, serviceId, shortcutKey }) =>
        `/services/client/${clientId}/${serviceId}/login/shortcut/${encodeURIComponent(shortcutKey)}`,
      transformResponse: (response: { success?: boolean; url?: string }) => ({ url: response.url ?? "" }),
    }),
    /** Disk/bandwidth usage from DB (usageSnapshot). updatedAt when last refreshed. */
    getHostingUsage: builder.query<
      { disk: { usedMb: number; limitMb: number }; bandwidth: { usedMb: number; limitMb: number }; updatedAt?: string | null },
      { clientId: string; serviceId: string }
    >({
      query: ({ clientId, serviceId }) => `/services/client/${clientId}/${serviceId}/usage`,
      transformResponse: (response: ApiResponse<{ disk: { usedMb: number; limitMb: number }; bandwidth: { usedMb: number; limitMb: number }; updatedAt?: string | null }>) =>
        response.data ?? { disk: { usedMb: 0, limitMb: 0 }, bandwidth: { usedMb: 0, limitMb: 0 }, updatedAt: null },
      providesTags: (_result, _err, { serviceId }) => [{ type: "Service", id: `${serviceId}-usage` }],
    }),

    /** Refresh usage from WHM, save to DB, return updated usage. Invalidates usage cache. */
    refreshHostingUsage: builder.mutation<
      { disk: { usedMb: number; limitMb: number }; bandwidth: { usedMb: number; limitMb: number }; updatedAt: string },
      { clientId: string; serviceId: string }
    >({
      query: ({ clientId, serviceId }) => ({
        url: `/services/client/${clientId}/${serviceId}/usage/refresh`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<{ disk: { usedMb: number; limitMb: number }; bandwidth: { usedMb: number; limitMb: number }; updatedAt: string }>) =>
        response.data ?? { disk: { usedMb: 0, limitMb: 0 }, bandwidth: { usedMb: 0, limitMb: 0 }, updatedAt: new Date().toISOString() },
      invalidatesTags: (_result, _err, { serviceId }) => [{ type: "Service", id: `${serviceId}-usage` }],
    }),

    // Admin service actions (require admin role). Pass { serviceId, clientId? } to also invalidate client list.
    adminSuspendService: builder.mutation<
      { data: unknown },
      string | { serviceId: string; clientId?: string }
    >({
      query: (arg) => ({
        url: `/services/admin/${typeof arg === "string" ? arg : arg.serviceId}/suspend`,
        method: "POST",
      }),
      invalidatesTags: (_result, _err, arg) => {
        const id = typeof arg === "string" ? arg : arg.serviceId;
        const clientId = typeof arg === "object" ? arg.clientId : undefined;
        const tags: Array<{ type: "Service"; id: string }> = [{ type: "Service", id }];
        if (clientId) tags.push({ type: "Service", id: `LIST-${clientId}` });
        return tags;
      },
    }),
    adminUnsuspendService: builder.mutation<
      { data: unknown },
      string | { serviceId: string; clientId?: string }
    >({
      query: (arg) => ({
        url: `/services/admin/${typeof arg === "string" ? arg : arg.serviceId}/unsuspend`,
        method: "POST",
      }),
      invalidatesTags: (_result, _err, arg) => {
        const id = typeof arg === "string" ? arg : arg.serviceId;
        const clientId = typeof arg === "object" ? arg.clientId : undefined;
        const tags: Array<{ type: "Service"; id: string }> = [{ type: "Service", id }];
        if (clientId) tags.push({ type: "Service", id: `LIST-${clientId}` });
        return tags;
      },
    }),
    adminTerminateService: builder.mutation<
      { data: unknown },
      string | { serviceId: string; clientId?: string }
    >({
      query: (arg) => ({
        url: `/services/admin/${typeof arg === "string" ? arg : arg.serviceId}/terminate`,
        method: "POST",
      }),
      invalidatesTags: (_result, _err, arg) => {
        const id = typeof arg === "string" ? arg : arg.serviceId;
        const clientId = typeof arg === "object" ? arg.clientId : undefined;
        const tags: Array<{ type: "Service"; id: string }> = [{ type: "Service", id }];
        if (clientId) tags.push({ type: "Service", id: `LIST-${clientId}` });
        return tags;
      },
    }),
    adminCancelPendingService: builder.mutation<
      { data: unknown },
      string | { serviceId: string; clientId?: string }
    >({
      query: (arg) => ({
        url: `/services/admin/${typeof arg === "string" ? arg : arg.serviceId}/cancel-pending`,
        method: "POST",
      }),
      invalidatesTags: (_result, _err, arg) => {
        const id = typeof arg === "string" ? arg : arg.serviceId;
        const clientId = typeof arg === "object" ? arg.clientId : undefined;
        const tags: Array<{ type: "Service"; id: string }> = [{ type: "Service", id }];
        if (clientId) tags.push({ type: "Service", id: `LIST-${clientId}` });
        return tags;
      },
    }),
    adminDeleteService: builder.mutation<
      { data: unknown },
      string | { serviceId: string; clientId?: string }
    >({
      query: (arg) => ({
        url: `/services/admin/${typeof arg === "string" ? arg : arg.serviceId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, arg) => {
        const id = typeof arg === "string" ? arg : arg.serviceId;
        const clientId = typeof arg === "object" ? arg.clientId : undefined;
        const tags: Array<{ type: "Service"; id: string }> = [{ type: "Service", id }];
        if (clientId) tags.push({ type: "Service", id: `LIST-${clientId}` });
        return tags;
      },
    }),
    adminChangePackage: builder.mutation<
      { data: unknown },
      { serviceId: string; plan: string; clientId?: string }
    >({
      query: ({ serviceId, plan }) => ({
        url: `/services/admin/${serviceId}/change-package`,
        method: "POST",
        body: { plan },
      }),
      invalidatesTags: (_result, _err, { serviceId, clientId }) => {
        const tags: Array<{ type: "Service"; id: string }> = [{ type: "Service", id: serviceId }];
        if (clientId) tags.push({ type: "Service", id: `LIST-${clientId}` });
        return tags;
      },
    }),
    adminChangePassword: builder.mutation<
      { data: unknown },
      { serviceId: string; password: string; username?: string; clientId?: string }
    >({
      query: ({ serviceId, password, username }) => ({
        url: `/services/admin/${serviceId}/change-password`,
        method: "POST",
        body: { password, username },
      }),
      invalidatesTags: (_result, _err, { serviceId, clientId }) => {
        const tags: Array<{ type: "Service"; id: string }> = [{ type: "Service", id: serviceId }];
        if (clientId) tags.push({ type: "Service", id: `LIST-${clientId}` });
        return tags;
      },
    }),
    adminRevealModulePassword: builder.mutation<
      { password: string; message?: string },
      { serviceId: string }
    >({
      query: ({ serviceId }) => ({
        url: `/services/admin/${serviceId}/module-password`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<{ password: string }>) => ({
        password: response.data?.password ?? "",
        message: response.message,
      }),
    }),
    adminRetryProvision: builder.mutation<
      { data: unknown },
      string | {
        serviceId: string;
        clientId?: string;
        username?: string;
        password?: string;
        serverId?: string;
        serverGroup?: string;
        serverLocation?: string;
        plan?: string;
        whmPackage?: string;
      }
    >({
      query: (arg) => ({
        url: `/services/admin/${typeof arg === "string" ? arg : arg.serviceId}/retry-provision`,
        method: "POST",
        body: typeof arg === "string"
          ? {}
          : {
            username: arg.username,
            password: arg.password,
            serverId: arg.serverId,
            serverGroup: arg.serverGroup,
            serverLocation: arg.serverLocation,
            plan: arg.plan,
            whmPackage: arg.whmPackage,
          },
      }),
      invalidatesTags: (_result, _err, arg) => {
        const id = typeof arg === "string" ? arg : arg.serviceId;
        const clientId = typeof arg === "object" ? arg.clientId : undefined;
        const tags: Array<{ type: "Service"; id: string }> = [{ type: "Service", id }];
        if (clientId) tags.push({ type: "Service", id: `LIST-${clientId}` });
        return tags;
      },
    }),
    adminUpdateStatus: builder.mutation<
      { data: unknown; message?: string },
      { serviceId: string; status: string; clientId?: string }
    >({
      query: ({ serviceId, status }) => ({
        url: `/services/admin/${serviceId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _err, { serviceId, clientId }) => {
        const tags: Array<{ type: "Service"; id: string }> = [{ type: "Service", id: serviceId }];
        if (clientId) tags.push({ type: "Service", id: `LIST-${clientId}` });
        return tags;
      },
    }),
    adminUpdateAutomation: builder.mutation<
      { data: unknown; message?: string },
      { serviceId: string; clientId?: string; autoSuspendAt?: string | null; autoTerminateAt?: string | null }
    >({
      query: ({ serviceId, autoSuspendAt, autoTerminateAt }) => ({
        url: `/services/admin/${serviceId}/automation`,
        method: "POST",
        body: { autoSuspendAt: autoSuspendAt ?? null, autoTerminateAt: autoTerminateAt ?? null },
      }),
      invalidatesTags: (_result, _err, { serviceId, clientId }) => {
        const tags: Array<{ type: "Service"; id: string }> = [{ type: "Service", id: serviceId }];
        if (clientId) tags.push({ type: "Service", id: `LIST-${clientId}` });
        return tags;
      },
    }),
    adminUpdateServiceProfile: builder.mutation<
      { data: unknown; message?: string },
      {
        serviceId: string;
        clientId?: string;
        productId?: string;
        packageName?: string;
        primaryDomain?: string;
        serverLocation?: string;
        billingCycle?: string;
        nextDueDate?: string;
        registrationDate?: string;
        paymentMethod?: string;
        firstPaymentAmount?: number;
        createdAt?: string;
        updatedAt?: string;
        recurringAmount?: number;
        currency?: string;
      }
    >({
      query: ({ serviceId, ...body }) => ({
        url: `/services/admin/${serviceId}/profile`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _err, { serviceId, clientId }) => {
        const tags: Array<{ type: "Service"; id: string }> = [{ type: "Service", id: serviceId }];
        if (clientId) tags.push({ type: "Service", id: `LIST-${clientId}` });
        return tags;
      },
    }),
    adminUpdateServiceNotes: builder.mutation<
      { data: unknown; message?: string },
      { serviceId: string; clientId?: string; adminNotes: string }
    >({
      query: ({ serviceId, adminNotes }) => ({
        url: `/services/admin/${serviceId}/notes`,
        method: "PATCH",
        body: { adminNotes },
      }),
      invalidatesTags: (_result, _err, { serviceId, clientId }) => {
        const tags: Array<{ type: "Service"; id: string }> = [{ type: "Service", id: serviceId }];
        if (clientId) tags.push({ type: "Service", id: `LIST-${clientId}` });
        return tags;
      },
    }),
    getAutomationSummary: builder.query<AutomationSummaryResponse, void>({
      query: () => ({
        url: "/services/admin/automation-summary",
      }),
      transformResponse: (response: ApiResponse<AutomationSummaryResponse>) => response.data,
      providesTags: [{ type: "Automation", id: "SUMMARY" }],
    }),
    getAutomationRuns: builder.query<
      AutomationRunsResponse,
      {
        page?: number;
        limit?: number;
        taskKey?: AutomationTaskKey;
        status?: AutomationRunStatus;
        source?: AutomationRunSource;
      } | void
    >({
      query: (params) => ({
        url: "/services/admin/automation-runs",
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<{
        results: Array<{
          _id: string;
          taskKey: AutomationTaskKey;
          taskLabel: string;
          category: string;
          source: AutomationRunSource;
          status: AutomationRunStatus;
          startedAt: string;
          completedAt?: string;
          durationMs?: number;
          errorMessage?: string;
          result?: Record<string, unknown>;
        }>;
        page: number;
        limit: number;
        totalResults: number;
        totalPages: number;
      }>) => ({
        results: (response.data?.results ?? []).map((item) => ({
          id: item._id,
          taskKey: item.taskKey,
          taskLabel: item.taskLabel,
          category: item.category,
          source: item.source,
          status: item.status,
          startedAt: item.startedAt,
          completedAt: item.completedAt,
          durationMs: item.durationMs,
          errorMessage: item.errorMessage,
          result: item.result,
        })),
        page: response.data?.page ?? 1,
        limit: response.data?.limit ?? 20,
        totalResults: response.data?.totalResults ?? 0,
        totalPages: response.data?.totalPages ?? 1,
      }),
      providesTags: [{ type: "Automation", id: "RUNS" }],
    }),
    triggerAutomationTask: builder.mutation<
      { message?: string; data?: Record<string, unknown> },
      { taskKey: AutomationTaskKey }
    >({
      query: ({ taskKey }) => ({
        url: `/services/admin/trigger/${taskKey}`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<Record<string, unknown>>) => ({
        message: response.message,
        data: response.data,
      }),
      invalidatesTags: [{ type: "Automation", id: "SUMMARY" }, { type: "Automation", id: "RUNS" }],
    }),
  }),
});

export const {
  useGetClientServicesQuery,
  useGetClientServiceByIdQuery,
  useGetCpanelShortcutsQuery,
  useCreateHostingEmailAccountMutation,
  useLazyGetShortcutLoginUrlQuery,
  useGetHostingUsageQuery,
  useRefreshHostingUsageMutation,
  useAdminSuspendServiceMutation,
  useAdminUnsuspendServiceMutation,
  useAdminTerminateServiceMutation,
  useAdminCancelPendingServiceMutation,
  useAdminDeleteServiceMutation,
  useAdminChangePackageMutation,
  useAdminChangePasswordMutation,
  useAdminRevealModulePasswordMutation,
  useAdminRetryProvisionMutation,
  useAdminUpdateStatusMutation,
  useAdminUpdateAutomationMutation,
  useAdminUpdateServiceProfileMutation,
  useAdminUpdateServiceNotesMutation,
  useGetAutomationSummaryQuery,
  useGetAutomationRunsQuery,
  useTriggerAutomationTaskMutation,
} = servicesApi;
