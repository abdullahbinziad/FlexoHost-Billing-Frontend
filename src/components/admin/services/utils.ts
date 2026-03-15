/**
 * Shared helpers for admin service components.
 */

export function getServiceDisplayDomain(service: {
  domain?: string;
  identifier?: string;
  name?: string;
}): string {
  if (service.identifier && service.identifier !== "—") return service.identifier;
  if (service.domain) return service.domain;
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
