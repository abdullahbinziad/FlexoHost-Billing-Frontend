"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";
import type { HostingServiceDetails } from "@/types/hosting-manage";
import { getServiceDisplayDomain } from "./utils";

export interface ServiceDetailsCardProps {
  service: HostingServiceDetails;
}

/** Read-only service details (WHMCS-style): Service Package, type, domain, billing, server. */
export function ServiceDetailsCard({ service }: ServiceDetailsCardProps) {
  const typeLabel =
    (service.productType as string) === "domain"
      ? "Domain"
      : service.productType === "email"
        ? "Email"
      : service.productType === "vps"
        ? "VPS"
        : "Hosting";

  const displayDomain = getServiceDisplayDomain(service);
  const servicePackage = service.packageName || service.name || "—";
  const billingCycle = service.billing?.billingCycle ?? "—";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Settings className="w-4 h-4 text-muted-foreground" />
          Service Details
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Service Package
          </label>
          <p className="font-semibold">{servicePackage}</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Type
          </label>
          <p className="font-medium capitalize">{typeLabel}</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Billing cycle
          </label>
          <p className="font-medium">{billingCycle}</p>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {typeLabel === "Domain" ? "Domain" : "Primary domain / identifier"}
          </label>
          <p className="font-medium">{displayDomain}</p>
        </div>
        {service.serverLocation && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Server location
            </label>
            <p className="font-medium">{service.serverLocation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
