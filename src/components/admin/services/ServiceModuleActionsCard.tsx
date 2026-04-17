"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { Shield, Play, Pause, StopCircle, RefreshCw, Loader2, KeyRound, Sparkles } from "lucide-react";
import {
  useAdminSuspendServiceMutation,
  useAdminUnsuspendServiceMutation,
  useAdminTerminateServiceMutation,
  useAdminChangePackageMutation,
  useAdminChangePasswordMutation,
  useAdminRevealModulePasswordMutation,
  useAdminRetryProvisionMutation,
} from "@/store/api/servicesApi";
import type { HostingServiceDetails } from "@/types/hosting-manage";
import { getServiceDisplayDomain } from "./utils";
import { useGetServersQuery } from "@/store/api/serverApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getServerGroups } from "@/types/admin";
import type { Product } from "@/types/admin";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { hasPermission } from "@/types/navigation";

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
   /** Currently selected hosting product/package (from Service Details) */
  selectedProduct?: Product | null;
}

export function ServiceModuleActionsCard({
  service,
  clientId,
  onSuccess,
  onError,
  selectedProduct,
}: ServiceModuleActionsCardProps) {
  const user = useSelector((s: RootState) => s.auth?.user ?? null);
  const canSuspend = hasPermission(user, "services:suspend");
  const canUnsuspend = hasPermission(user, "services:unsuspend");
  const canTerminate = hasPermission(user, "services:terminate");
  const canRetryProvision = hasPermission(user, "services:retry_provision");
  const canChangePackage = hasPermission(user, "services:change_package");
  const canChangePassword = hasPermission(user, "services:change_password");
  const canViewSavedPassword = hasPermission(user, "services:view_password");

  const isMongoObjectId = (value?: string) => /^[a-f0-9]{24}$/i.test(String(value || "").trim());
  const randomLetters = (length = 3) => {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    let out = "";
    for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  };
  const generateUsernameFromDomain = (domainValue: string) => {
    const domainBase = String(domainValue || "")
      .replace(/^www\./i, "")
      .split("/")[0]
      .split(".")[0]
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .slice(0, 13);
    const base = domainBase || "user";
    return `${base}${randomLetters(3)}`.slice(0, 16);
  };
  const displayDomain = getServiceDisplayDomain(service);
  const suggestedUsername = useMemo(() => {
    return generateUsernameFromDomain(displayDomain);
  }, [displayDomain]);
  const generateStrongPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    let out = "";
    for (let i = 0; i < 16; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  };
  const [moduleUsername, setModuleUsername] = useState(suggestedUsername);
  const [modulePassword, setModulePassword] = useState(generateStrongPassword());
  const [moduleServerId, setModuleServerId] = useState("");
  const [modulePackage, setModulePackage] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [showChangePasswordConfirm, setShowChangePasswordConfirm] = useState(false);
  const { data: servers = [] } = useGetServersQuery();
  const cpanelServers = useMemo(
    () => (servers || []).filter((s: any) => String(s?.module?.type || "").toLowerCase() === "cpanel"),
    [servers]
  );
  const productServerGroup = useMemo(
    () => (selectedProduct?.module?.serverGroup ? String(selectedProduct.module.serverGroup) : ""),
    [selectedProduct]
  );
  const baseEligibleServers = useMemo(() => {
    if (productServerGroup) {
      return cpanelServers.filter((s: any) => getServerGroups(s as any).includes(productServerGroup as any));
    }
    return cpanelServers;
  }, [cpanelServers, productServerGroup]);
  const effectiveLocation = String(service.serverLocation || "").trim();
  const groupOptions = useMemo(() => {
    const groups = new Set<string>();
    (baseEligibleServers || [])
      .filter((s: any) => !effectiveLocation || s.location === effectiveLocation)
      .forEach((s: any) => {
        getServerGroups(s as any).forEach((g) => groups.add(g));
      });
    return Array.from(groups);
  }, [baseEligibleServers, effectiveLocation]);
  const filteredServers = useMemo(() => {
    let list = baseEligibleServers;
    if (effectiveLocation) {
      list = list.filter((s: any) => s.location === effectiveLocation);
    }
    if (selectedGroup) {
      list = list.filter((s: any) => getServerGroups(s as any).includes(selectedGroup as any));
    }
    // Capacity filter: only servers with free slots (current < max)
    list = list.filter((s: any) => {
      const current = typeof s.accountCount === "number" ? s.accountCount : 0;
      const max = typeof s.maxAccounts === "number" ? s.maxAccounts : 200;
      return current < max;
    });
    return list;
  }, [baseEligibleServers, effectiveLocation, selectedGroup]);
  const packageOptions = useMemo(() => {
    const selectedServer = filteredServers.find(
      (s: any) => String(s?.id || s?._id || "") === moduleServerId
    );
    const names = (selectedServer?.whmPackages || [])
      .map((pkg: any) => String(pkg || "").trim())
      .filter(Boolean);
    // Keep currently selected package visible even if current server package list doesn't include it yet.
    const selectedValue = String(modulePackage || "").trim();
    if (selectedValue) names.unshift(selectedValue);
    return Array.from(new Set(names));
  }, [filteredServers, moduleServerId, modulePackage]);

  useEffect(() => {
    const ctx = service.moduleContext;
    if (ctx?.accountUsername?.trim()) setModuleUsername(ctx.accountUsername.trim());
    if (ctx?.serverId?.trim()) setModuleServerId(ctx.serverId.trim());
    if (ctx?.serverGroup?.trim()) setSelectedGroup(ctx.serverGroup.trim());
    const pkgFromCtx = ctx?.whmPackage?.trim();
    const pkgFromProduct = selectedProduct?.module?.packageName?.trim();
    if (pkgFromCtx) setModulePackage(pkgFromCtx);
    else if (pkgFromProduct) setModulePackage(pkgFromProduct);
  }, [service.moduleContext, selectedProduct]);

  useEffect(() => {
    // Normalize legacy/incorrect saved package IDs to readable package names.
    const current = String(modulePackage || "").trim();
    if (!current || !isMongoObjectId(current)) return;
    const preferredName = String(service.packageName || "").trim();
    if (preferredName && packageOptions.includes(preferredName)) {
      setModulePackage(preferredName);
      return;
    }
    if (!packageOptions.includes(current)) {
      setModulePackage("");
    }
  }, [modulePackage, packageOptions, service.packageName]);

  useEffect(() => {
    if (!productServerGroup) return;
    setSelectedGroup(productServerGroup);
  }, [productServerGroup]);

  useEffect(() => {
    if (moduleServerId) return;
    const first = filteredServers[0];
    const serverId = first ? String((first as any).id || (first as any)._id || "") : "";
    if (serverId) setModuleServerId(serverId);
  }, [filteredServers, moduleServerId]);

  const arg = clientId ? { serviceId: service.id, clientId } : service.id;
  const changePackageArg = (plan: string) => (clientId ? { serviceId: service.id, plan, clientId } : { serviceId: service.id, plan });

  const [suspend, { isLoading: suspending }] = useAdminSuspendServiceMutation();
  const [unsuspend, { isLoading: unsuspending }] = useAdminUnsuspendServiceMutation();
  const [terminate, { isLoading: terminating }] = useAdminTerminateServiceMutation();
  const [changePackage, { isLoading: changingPackage }] = useAdminChangePackageMutation();
  const [changePassword, { isLoading: changingPassword }] = useAdminChangePasswordMutation();
  const [revealModulePassword, { isLoading: revealingPassword }] = useAdminRevealModulePasswordMutation();
  const [retryProvision, { isLoading: retrying }] = useAdminRetryProvisionMutation();

  const isBusy = suspending || unsuspending || terminating || changingPackage || changingPassword || retrying || revealingPassword;
  const isHostingOrVps = service.productType === "hosting" || service.productType === "vps";
  const changePasswordDisabled = !isHostingOrVps;
  const hasAnySavedModuleData = Boolean(
    service.moduleContext?.accountUsername ||
    service.moduleContext?.serverId ||
    service.moduleContext?.serverGroup ||
    service.moduleContext?.whmPackage ||
    service.moduleContext?.hasSavedPassword
  );

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

  const handleLoadSavedModuleData = async () => {
    const ctx = service.moduleContext;
    if (ctx?.accountUsername?.trim()) setModuleUsername(ctx.accountUsername.trim());
    if (ctx?.serverGroup?.trim()) setSelectedGroup(ctx.serverGroup.trim());
    if (ctx?.serverId?.trim()) setModuleServerId(ctx.serverId.trim());
    if (ctx?.whmPackage?.trim()) setModulePackage(ctx.whmPackage.trim());

    if (ctx?.hasSavedPassword && canViewSavedPassword) {
      try {
        const res = await revealModulePassword({ serviceId: service.id }).unwrap();
        if (res.password) {
          setModulePassword(res.password);
        }
      } catch (e: unknown) {
        const message =
          e && typeof e === "object" && "data" in e
            ? (e as { data?: { message?: string } }).data?.message
            : (e as Error)?.message ?? "Failed to load saved password";
        toast.error(message ?? "Failed to load saved password");
        return;
      }
    } else if (ctx?.hasSavedPassword && !canViewSavedPassword) {
      toast.warning("Saved password is protected by permission.");
    }

    toast.success("Saved module data loaded.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          Module Controller
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Core Configuration
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start sm:self-auto"
              disabled={!hasAnySavedModuleData || revealingPassword}
              onClick={handleLoadSavedModuleData}
            >
              {revealingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Load saved all
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="space-y-2 md:col-span-6">
              <Label>Username</Label>
              <div className="flex gap-2">
                <Input
                  value={moduleUsername}
                  onChange={(e) => setModuleUsername(e.target.value)}
                  placeholder="cpanel username"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Generate username"
                  title="Generate username"
                  onClick={() => setModuleUsername(generateUsernameFromDomain(displayDomain))}
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 md:col-span-6">
              <Label>Password</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={modulePassword}
                  onChange={(e) => setModulePassword(e.target.value)}
                  placeholder="new password"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Generate password"
                  title="Generate password"
                  onClick={() => setModulePassword(generateStrongPassword())}
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>
              {service.moduleContext?.lastPasswordUpdatedAt ? (
                <p className="text-[11px] text-muted-foreground">
                  Saved password updated at {new Date(service.moduleContext.lastPasswordUpdatedAt).toLocaleString()}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-4">
              <Label>Server group</Label>
              <Select
                value={selectedGroup || "__all__"}
                onValueChange={(v) => setSelectedGroup(v === "__all__" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select server group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All groups</SelectItem>
                  {groupOptions.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-4">
              <Label>Server selection</Label>
              <Select value={moduleServerId || "__auto__"} onValueChange={(v) => setModuleServerId(v === "__auto__" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select server" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__auto__">Auto select server</SelectItem>
                  {filteredServers.map((s: any) => {
                    const id = String(s.id || s._id);
                    const current = typeof s.accountCount === "number" ? s.accountCount : 0;
                    const max = typeof s.maxAccounts === "number" ? s.maxAccounts : 200;
                    const label = `${s.name || s.hostname || id} (${current}/${max})`;
                    return (
                      <SelectItem key={id} value={id}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-4">
              <Label>Package selection</Label>
              <Select value={modulePackage || "__none__"} onValueChange={(v) => setModulePackage(v === "__none__" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select WHM package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No package selected</SelectItem>
                  {packageOptions.map((pkg) => (
                    <SelectItem key={pkg} value={pkg}>
                      {pkg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Module Actions
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="gap-2 justify-start"
              disabled={isBusy || !canSuspend}
              title={!canSuspend ? "You do not have permission: services:suspend" : undefined}
              onClick={() => run(() => suspend(arg).unwrap())}
            >
              {suspending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4 text-amber-500" />}
              Suspend
            </Button>
            <Button
              variant="outline"
              className="gap-2 justify-start"
              disabled={isBusy || !canUnsuspend}
              title={!canUnsuspend ? "You do not have permission: services:unsuspend" : undefined}
              onClick={() => run(() => unsuspend(arg).unwrap())}
            >
              {unsuspending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 text-green-600" />}
              Unsuspend
            </Button>
            <Button
              variant="outline"
              className="gap-2 justify-start hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20"
              disabled={isBusy || !canTerminate}
              title={!canTerminate ? "You do not have permission: services:terminate" : undefined}
              onClick={() => setShowTerminateConfirm(true)}
            >
              {terminating ? <Loader2 className="w-4 h-4 animate-spin" /> : <StopCircle className="w-4 h-4 text-red-500" />}
              Terminate
            </Button>
            <Button
              variant="outline"
              className="gap-2 justify-start"
              disabled={isBusy || !canRetryProvision}
              title={!canRetryProvision ? "You do not have permission: services:retry_provision" : undefined}
              onClick={() =>
                run(() =>
                  retryProvision({
                    serviceId: service.id,
                    clientId,
                    username: moduleUsername.trim(),
                    password: modulePassword,
                    serverId: moduleServerId || undefined,
                    serverGroup: selectedGroup || undefined,
                    serverLocation: service.serverLocation || undefined,
                    plan: modulePackage.trim() || undefined,
                    whmPackage: modulePackage.trim() || undefined,
                  }).unwrap()
                )
              }
            >
              {retrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Create
            </Button>
            <Button
              variant="outline"
              className="gap-2 justify-start"
              disabled={isBusy || !canChangePackage}
              title={!canChangePackage ? "You do not have permission: services:change_package" : undefined}
              onClick={() => run(() => changePackage(changePackageArg(modulePackage.trim())).unwrap())}
            >
              {changingPackage ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Change Package
            </Button>
            <Button
              variant="outline"
              className="gap-2 justify-start"
              disabled={isBusy || changePasswordDisabled || !canChangePassword}
              title={
                !isHostingOrVps
                  ? "Change password is available for hosting/VPS services"
                  : !canChangePassword
                    ? "You do not have permission: services:change_password"
                    : undefined
              }
              onClick={() => setShowChangePasswordConfirm(true)}
            >
              {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Change Password
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Password change uses the exact current value from the Password field above.
          </p>
        </div>

        <ConfirmActionDialog
          open={showTerminateConfirm}
          onOpenChange={setShowTerminateConfirm}
          title="Terminate this service?"
          description="This action cannot be undone."
          confirmLabel="Terminate"
          onConfirm={() => {
            run(() => terminate(arg).unwrap());
            setShowTerminateConfirm(false);
          }}
          isLoading={isBusy}
        />
        <ConfirmActionDialog
          open={showChangePasswordConfirm}
          onOpenChange={setShowChangePasswordConfirm}
          title="Change hosting password?"
          description="This will set a new password for the linked cPanel account via WHM."
          confirmLabel="Change Password"
          onConfirm={() => {
            run(() =>
              changePassword({
                serviceId: service.id,
                clientId,
                username: moduleUsername.trim() || undefined,
                password: modulePassword,
              }).unwrap()
            );
            setShowChangePasswordConfirm(false);
          }}
          isLoading={isBusy}
        />
      </CardContent>
    </Card>
  );
}
