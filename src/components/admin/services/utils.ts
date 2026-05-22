/**
 * Shared helpers for admin service components.
 */

export function getServiceDisplayDomain(service: {
  domain?: string;
  identifier?: string;
  name?: string;
}): string {
  const domain = (service.domain || "").trim();
  const identifier = (service.identifier || "").trim();
  const isMissing = (v: string) => !v || v === "—";

  /** Prefer resolved primary domain (details) over list identifier (can be username or stale). */
  if (!isMissing(domain)) return domain;
  if (!isMissing(identifier)) return identifier;
  if (service.name) return service.name;
  return "—";
}

export function getAdminClientServicePath(
  clientId: string,
  serviceId: string,
  productType?: string
): string {
  if (productType === "domain") {
    return `/admin/clients/${clientId}/domains/${serviceId}`;
  }

  if (productType === "vps") {
    return `/admin/clients/${clientId}/vps/${serviceId}`;
  }

  if (productType === "email") {
    return `/admin/clients/${clientId}/email-services/${serviceId}`;
  }

  if (productType === "hosting" || productType === "dedicated") {
    return `/admin/clients/${clientId}/hosting/${serviceId}`;
  }

  return `/admin/clients/${clientId}/hosting/${serviceId}`;
}

export function getAdminClientServiceListPath(
  clientId: string,
  productType?: string
): string {
  if (productType === "vps") {
    return `/admin/clients/${clientId}/vps`;
  }

  if (productType === "email") {
    return `/admin/clients/${clientId}/email-services`;
  }

  if (productType === "domain") {
    return `/admin/clients/${clientId}/domains`;
  }

  return `/admin/clients/${clientId}/hosting`;
}
