"use client";

import { useEffect, useState } from "react";
import {
  useAdminUpdateServiceNotesMutation,
  useGetHostingUsageQuery,
  useGetClientServiceByIdQuery,
  useLazyGetShortcutLoginUrlQuery,
  useRefreshHostingUsageMutation,
} from "@/store/api/servicesApi";
import {
  ServiceAutomationCard,
  ServiceBillingCard,
  ServiceDetailHeader,
  ServiceDetailsCard,
  ServiceModuleActionsCard,
  ServiceResourceUsageCard,
  ServiceStatusTrackingCard,
} from "@/components/admin/services";
import { getAdminClientServiceListPath } from "@/components/admin/services/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { formatDateTime } from "@/utils/format";
import { toast } from "sonner";

export interface ClientServiceDetailContentProps {
  clientId: string;
  serviceId: string;
}

export function ClientServiceDetailContent({
  clientId,
  serviceId,
}: ClientServiceDetailContentProps) {
  const { data: service, isLoading, error } = useGetClientServiceByIdQuery(
    { clientId, serviceId },
    { skip: !clientId || !serviceId }
  );

  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    setAdminNotes(service?.adminNotes ?? "");
  }, [service?.adminNotes]);

  const [updateNotes, { isLoading: isSavingNotes }] = useAdminUpdateServiceNotesMutation();
  const [refreshUsage, { isLoading: isRefreshingUsage }] = useRefreshHostingUsageMutation();

  const isHosting = service?.productType === "hosting";
  const { data: usage, isLoading: usageLoading } = useGetHostingUsageQuery(
    { clientId, serviceId },
    { skip: !clientId || !serviceId || !isHosting }
  );

  const [fetchLoginUrl, { isLoading: loginLoading }] = useLazyGetShortcutLoginUrlQuery();

  const handleLoginClick = async () => {
    if (!clientId || !serviceId) return;
    try {
      const result = await fetchLoginUrl({
        clientId,
        serviceId,
        shortcutKey: "cpanel-home",
      }).unwrap();
      if (result?.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      }
    } catch {
      // Login URL failed; user can try again
    }
  };

  const lastUpdated =
    usage && usage.updatedAt
      ? formatDateTime(usage.updatedAt)
      : usage
        ? "—"
        : undefined;

  const handleRefreshUsage = async () => {
    if (!clientId || !serviceId) return;
    try {
      await refreshUsage({ clientId, serviceId }).unwrap();
      toast.success("Usage refreshed");
    } catch {
      toast.error("Failed to refresh usage");
    }
  };

  const handleSaveNotes = async () => {
    try {
      await updateNotes({ serviceId, clientId, adminNotes }).unwrap();
      toast.success("Admin notes saved");
    } catch {
      toast.error("Failed to save admin notes");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="font-medium text-destructive">Service not found or you don’t have access.</p>
        <p className="text-sm text-muted-foreground mt-1">
          It may have been deleted or the link is incorrect.
        </p>
      </div>
    );
  }

  const backHref = getAdminClientServiceListPath(clientId, service.productType);
  const backLabel =
    service.productType === "vps"
      ? "Back to VPS"
      : service.productType === "email"
        ? "Back to Email Services"
        : "Back to Hosting";

  return (
    <div className="space-y-6">
      <ServiceDetailHeader
        service={service}
        backHref={backHref}
        backLabel={backLabel}
        onLoginClick={isHosting ? handleLoginClick : undefined}
        loginLoading={loginLoading}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <ServiceDetailsCard service={service} />
          <ServiceModuleActionsCard service={service} clientId={clientId} />
          {isHosting && (
            <ServiceResourceUsageCard
              disk={usage?.disk}
              bandwidth={usage?.bandwidth}
              isLoading={usageLoading}
              lastUpdated={lastUpdated}
              onRefresh={handleRefreshUsage}
              isRefreshing={isRefreshingUsage}
            />
          )}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">Admin Notes</h3>
                <Button size="sm" onClick={handleSaveNotes} disabled={isSavingNotes}>
                  {isSavingNotes && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Save
                </Button>
              </div>
              <Textarea
                placeholder="Add private notes about this service…"
                className="min-h-[100px] resize-y"
                value={adminNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <ServiceStatusTrackingCard service={service} />
          <ServiceAutomationCard service={service} clientId={clientId} />
          <ServiceBillingCard service={service} />
        </div>
      </div>
    </div>
  );
}
