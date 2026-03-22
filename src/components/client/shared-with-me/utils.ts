/**
 * Build manage path for a shared service (base path: /shared-with-me/[clientId]/...).
 */
export function getSharedServiceManagePath(
  clientId: string,
  serviceId: string,
  productType: string
): string {
  if (productType === "vps") return `/shared-with-me/${clientId}/vps/${serviceId}`;
  if (productType === "hosting" || productType === "dedicated")
    return `/shared-with-me/${clientId}/hosting/${serviceId}`;
  return `/shared-with-me/${clientId}/service/${serviceId}`;
}
