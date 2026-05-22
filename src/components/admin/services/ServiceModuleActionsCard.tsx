"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Play, Pause, StopCircle, RefreshCw, Loader2 } from "lucide-react";
import {
  useAdminSuspendServiceMutation,
  useAdminUnsuspendServiceMutation,
  useAdminTerminateServiceMutation,
  useAdminChangePackageMutation,
  useAdminRetryProvisionMutation,
} from "@/store/api/servicesApi";
import type { HostingServiceDetails } from "@/types/hosting-manage";
import { getServiceDisplayDomain } from "./utils";

/** API response shape from admin service actions */
interface AdminActionResponse {
  success?: boolean;
  data?: unknown;
  message?: string;
}

export interface ServiceModuleActionsCardProps {
  service: HostingServiceDetails;
  /** Pass to invalidate client service list after actions */
  clientId?: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export function ServiceModuleActionsCard({
  service,
  clientId,
  onSuccess,
  onError,
}: ServiceModuleActionsCardProps) {
  const [changePackagePlan, setChangePackagePlan] = useState("");

  const arg = clientId ? { serviceId: service.id, clientId } : service.id;
  const changePackageArg = (plan: string) =>
    clientId ? { serviceId: service.id, plan, clientId } : { serviceId: service.id, plan };

  const [suspend, { isLoading: suspending }] = useAdminSuspendServiceMutation();
  const [unsuspend, { isLoading: unsuspending }] = useAdminUnsuspendServiceMutation();
  const [terminate, { isLoading: terminating }] = useAdminTerminateServiceMutation();
  const [changePackage, { isLoading: changingPackage }] = useAdminChangePackageMutation();
  const [retryProvision, { isLoading: retrying }] = useAdminRetryProvisionMutation();

  const isBusy = suspending || unsuspending || terminating || changingPackage || retrying;
  const isHostingOrVps = service.productType === "hosting" || service.productType === "vps";
  const status = service.status?.toLowerCase() ?? "";
  // WHMCS-style: buttons always visible; disabled when action doesn't apply
  const suspendDisabled = !isHostingOrVps || status !== "active";
  const unsuspendDisabled = !isHostingOrVps || status !== "suspended";
  const terminateDisabled = !isHostingOrVps || status === "terminated";
  const retryProvisionDisabled =
    !isHostingOrVps || !["pending", "provisioning", "suspended", "terminated"].includes(status);
  const changePackageDisabled = status === "terminated";

  const displayDomain = getServiceDisplayDomain(service);
  const domainLabel = displayDomain !== "—" ? displayDomain : "Service";

  const run = async (fn: () => Promise<AdminActionResponse | void>) => {
    try {
      const result = await fn();
      onSuccess?.();
      const msg = result && typeof result === "object" && "message" in result ? result.message : undefined;
      if (msg) {
        toast.success(msg, {
          description: domainLabel !== "—" ? `${domainLabel}` : undefined,
        });
      }
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "data" in e
          ? (e as { data?: { message?: string } }).data?.message
          : (e as Error)?.message ?? "Action failed";
      toast.error(message, {
        description: domainLabel !== "—" ? `${domainLabel}` : undefined,
      });
      onError?.(message ?? "Action failed");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          Module Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isHostingOrVps ? (
          <>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="gap-2"
                disabled={isBusy || suspendDisabled}
                onClick={() => run(() => suspend(arg).unwrap())}
                title={suspendDisabled ? "Only active services can be suspended" : undefined}
              >
                {suspending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4 text-amber-500" />}
                Suspend
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                disabled={isBusy || unsuspendDisabled}
                onClick={() => run(() => unsuspend(arg).unwrap())}
                title={unsuspendDisabled ? "Only suspended services can be unsuspended" : undefined}
              >
                {unsuspending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 text-green-600" />}
                Unsuspend
              </Button>
              <Button
                variant="outline"
                className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20"
                disabled={isBusy || terminateDisabled}
                onClick={() => {
                  if (typeof window !== "undefined" && !window.confirm("Terminate this service? This cannot be undone.")) return;
                  run(() => terminate(arg).unwrap());
                }}
                title={terminateDisabled ? "Service is already terminated" : undefined}
              >
                {terminating ? <Loader2 className="w-4 h-4 animate-spin" /> : <StopCircle className="w-4 h-4 text-red-500" />}
                Terminate
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                disabled={isBusy || retryProvisionDisabled}
                onClick={() => run(() => retryProvision(arg).unwrap())}
                title={retryProvisionDisabled ? "Retry available for pending, suspended, or terminated" : undefined}
              >
                {retrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Retry Provision
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              <input
                type="text"
                placeholder="Package / plan name"
                className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={changePackagePlan}
                onChange={(e) => setChangePackagePlan(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={isBusy || !changePackagePlan.trim() || changePackageDisabled}
                onClick={() =>
                  run(() =>
                    changePackage(changePackageArg(changePackagePlan.trim())).unwrap()
                  )
                }
                title={changePackageDisabled ? "Cannot change package for terminated service" : undefined}
              >
                {changingPackage ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Change Package
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Module actions are available for Hosting and VPS services only.</p>
        )}
      </CardContent>
    </Card>
  );
}
