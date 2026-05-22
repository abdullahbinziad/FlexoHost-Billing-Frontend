import type { LucideIcon } from "lucide-react";
import { Grid3x3, Server, Globe, Mail, Key } from "lucide-react";

export const SERVICE_TYPE_ICONS: Record<string, LucideIcon> = {
  HOSTING: Grid3x3,
  VPS: Server,
  DOMAIN: Globe,
  EMAIL: Mail,
  LICENSE: Key,
};

export function getServiceTypeIcon(productType: string): LucideIcon {
  if (productType === "vps") return SERVICE_TYPE_ICONS.VPS;
  if (productType === "hosting" || productType === "dedicated") return SERVICE_TYPE_ICONS.HOSTING;
  return SERVICE_TYPE_ICONS.HOSTING;
}

export function getServiceTypeLabel(productType: string): string {
  if (productType === "vps") return "VPS";
  if (productType === "hosting") return "Hosting";
  if (productType === "dedicated") return "Dedicated";
  return productType ?? "Service";
}
