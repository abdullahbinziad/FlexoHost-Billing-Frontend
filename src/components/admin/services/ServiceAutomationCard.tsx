"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarClock, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminUpdateAutomationMutation } from "@/store/api/servicesApi";
import type { HostingServiceDetails } from "@/types/hosting-manage";
import { getServiceDisplayDomain } from "./utils";

export interface ServiceAutomationCardProps {
  service: HostingServiceDetails;
  clientId: string;
}

function toLocalInputValue(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const offsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function ServiceAutomationCard({ service, clientId }: ServiceAutomationCardProps) {
  const displayDomain = getServiceDisplayDomain(service);
  const domainLabel = displayDomain !== "—" ? displayDomain : "Service";
  const initialSuspend = useMemo(() => toLocalInputValue(service.autoSuspendAt), [service.autoSuspendAt]);
  const initialTerminate = useMemo(() => toLocalInputValue(service.autoTerminateAt), [service.autoTerminateAt]);

  const [autoSuspendAt, setAutoSuspendAt] = useState(initialSuspend);
  const [autoTerminateAt, setAutoTerminateAt] = useState(initialTerminate);

  const [updateAutomation, { isLoading }] = useAdminUpdateAutomationMutation();

  const hasChanges = autoSuspendAt !== initialSuspend || autoTerminateAt !== initialTerminate;

  const onSave = async () => {
    try {
      const payload = {
        serviceId: service.id,
        clientId,
        autoSuspendAt: autoSuspendAt ? new Date(autoSuspendAt).toISOString() : null,
        autoTerminateAt: autoTerminateAt ? new Date(autoTerminateAt).toISOString() : null,
      };
      const res = await updateAutomation(payload).unwrap();
      toast.success(res?.message || "Automation schedule updated.", {
        description: domainLabel !== "—" ? domainLabel : undefined,
      });
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "data" in e
          ? (e as { data?: { message?: string } }).data?.message
          : (e as Error)?.message ?? "Failed to update automation schedule";
      toast.error(message, {
        description: domainLabel !== "—" ? domainLabel : undefined,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-muted-foreground" />
          Automation Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Auto suspend at
          </label>
          <Input
            type="datetime-local"
            value={autoSuspendAt}
            onChange={(e) => setAutoSuspendAt(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Auto terminate at
          </label>
          <Input
            type="datetime-local"
            value={autoTerminateAt}
            onChange={(e) => setAutoTerminateAt(e.target.value)}
          />
        </div>
        <Button onClick={onSave} disabled={isLoading || !hasChanges} className="w-full">
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save automation dates
        </Button>
      </CardContent>
    </Card>
  );
}

