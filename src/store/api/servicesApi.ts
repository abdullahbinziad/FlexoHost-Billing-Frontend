import { api } from "./baseApi";
import { ApiResponse } from "@/types/api";
import type { HostingService } from "@/types/hosting";
import type { HostingServiceDetails } from "@/types/hosting-manage";

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
    serverLocation?: string;
    resourceLimits?: { diskMb: number; bandwidthMb: number };
    [key: string]: unknown;
  } | null;
}

function mapStatus(status: string): HostingService["status"] {
  const s = (status || "").toLowerCase();
  if (s === "active") return "active";
  if (s === "suspended") return "suspended";
  if (s === "terminated" || s === "failed") return "expired";
  return "pending";
}

function formatDate(d: string | Date): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

/** Map backend list item to HostingService for /hosting page */
export function mapServiceToHostingService(s: ClientServiceApiItem): HostingService {
  const nextDue = s.nextDueDate ? new Date(s.nextDueDate) : null;
  const now = new Date();
  const expiredDaysAgo =
    nextDue && nextDue < now && mapStatus(s.status) === "expired"
      ? Math.floor((now.getTime() - nextDue.getTime()) / (24 * 60 * 60 * 1000))
      : undefined;

  return {
    id: s._id,
    name: s.displayName || "Hosting",
    identifier: s.identifier || "—",
    status: mapStatus(s.status),
    ...(expiredDaysAgo !== undefined && { expiredDaysAgo }),
    expirationDate: formatDate(s.nextDueDate),
    nextDueDate: formatDate(s.nextDueDate),
    renewalDate: formatDate(s.nextDueDate),
    pricing: {
      amount: s.priceSnapshot?.recurring ?? s.priceSnapshot?.total ?? 0,
      currency: s.currency || "BDT",
      billingCycle: (s.billingCycle || "annually") as HostingService["pricing"]["billingCycle"],
    },
    productType: (s.type === "VPS" ? "vps" : "hosting") as HostingService["productType"],
    serverLocation: s.serverLocation,
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

  return {
    ...base,
    domain: details.primaryDomain || base.identifier,
    packageName: base.name,
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
      firstPaymentAmount: svc.priceSnapshot?.total ?? base.pricing.amount,
      recurringAmount: base.pricing.amount,
      billingCycle: base.pricing.billingCycle.charAt(0).toUpperCase() + base.pricing.billingCycle.slice(1),
      paymentMethod: "—",
      registrationDate: formatDate((svc as any).createdAt) || "—",
      nextDueDate: base.nextDueDate,
      currency: base.pricing.currency,
    },
  };
}

export interface GetClientServicesParams {
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
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
  }),
});

export const { useGetClientServicesQuery, useGetClientServiceByIdQuery } = servicesApi;
