"use client";

import { useActiveClient } from "@/hooks/useActiveClient";
import { useGetClientServicesQuery } from "@/store/api/servicesApi";
import type { HostingService } from "@/types/hosting";

export interface UseClientServicesPageOptions {
  /** Filter by service type (HOSTING, VPS). Omit for all types. */
  type?: "HOSTING" | "VPS";
  limit?: number;
}

export interface UseClientServicesPageResult {
  clientId: string;
  services: HostingService[];
  isLoading: boolean;
  isProfileLoading: boolean;
  /** True when we have no client (profile not loaded or missing). */
  noClient: boolean;
}

/**
 * Shared data for client-scoped service list pages (Hosting, VPS).
 * Uses active client (own or acting-as) and fetches services from API.
 */
export function useClientServicesPage(
  options: UseClientServicesPageOptions = {}
): UseClientServicesPageResult {
  const { type, limit = 100 } = options;
  const { activeClientId, isProfileLoading } = useActiveClient();
  const clientId = activeClientId ?? "";

  const { data, isLoading: servicesLoading } = useGetClientServicesQuery(
    { clientId, params: { ...(type && { type }), limit } },
    { skip: !clientId }
  );

  const services = data?.services ?? [];
  const isLoading = Boolean(clientId && servicesLoading);
  const noClient = !clientId && !isProfileLoading;

  return {
    clientId,
    services,
    isLoading,
    isProfileLoading,
    noClient,
  };
}
