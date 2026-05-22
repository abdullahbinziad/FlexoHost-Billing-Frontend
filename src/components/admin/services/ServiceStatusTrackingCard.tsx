"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Globe, Activity } from "lucide-react";
import { formatDateTime as formatDt } from "@/utils/format";
import type { HostingServiceDetails } from "@/types/hosting-manage";
import { getServiceDisplayDomain } from "./utils";

export interface ServiceStatusTrackingCardProps {
  service: HostingServiceDetails;
}

function formatOrDash(iso?: string): string {
  return iso ? formatDt(iso) : "—";
}

export function ServiceStatusTrackingCard({ service }: ServiceStatusTrackingCardProps) {
  const domain = getServiceDisplayDomain(service);
  const status = (service.status ?? "").toString();
  const suspendedAt = service.suspendedAt;
  const terminatedAt = service.terminatedAt;
  const createdAt = service.createdAt;
  const updatedAt = service.updatedAt;
  const nextDueDate = service.nextDueDate;
  const graceUntil = service.graceUntil;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          Status & tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            Domain / identifier
          </label>
          <p className="font-medium break-all">{domain}</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Created at
          </label>
          <p className="font-medium text-muted-foreground">
            {formatOrDash(createdAt)}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Last updated
          </label>
          <p className="font-medium text-muted-foreground">
            {formatOrDash(updatedAt)}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Next due date
          </label>
          <p className="font-medium text-muted-foreground">
            {formatOrDash(nextDueDate)}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Grace until
          </label>
          <p className="font-medium text-muted-foreground">
            {formatOrDash(graceUntil)}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Current status
          </label>
          <div>
            <Badge variant="secondary" className="capitalize">
              {status}
            </Badge>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Suspended at
          </label>
          <p className="font-medium text-muted-foreground">
            {formatOrDash(suspendedAt)}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Terminated at
          </label>
          <p className="font-medium text-muted-foreground">
            {formatOrDash(terminatedAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
