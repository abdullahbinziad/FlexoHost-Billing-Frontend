"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { HostingService } from "@/types/hosting";
import { getServiceTypeIcon, getServiceTypeLabel } from "../constants";
import { getSharedServiceManagePath } from "../utils";

export interface SharedServiceListProps {
  clientId: string;
  services: HostingService[];
  emptyMessage?: string;
}

export function SharedServiceList({
  clientId,
  services,
  emptyMessage = "No services are shared with you for this client, or there are no matching services.",
}: SharedServiceListProps) {
  const router = useRouter();

  const handleManage = (serviceId: string, productType: string) => {
    router.push(getSharedServiceManagePath(clientId, serviceId, productType));
  };

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {services.map((s) => {
            const Icon = getServiceTypeIcon(s.productType);
            const typeLabel = getServiceTypeLabel(s.productType);
            return (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{s.name || s.identifier || s.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {typeLabel} · {s.status}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManage(s.id, s.productType)}
                >
                  Manage
                </Button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
