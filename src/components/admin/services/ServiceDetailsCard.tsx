"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";
import type { HostingServiceDetails } from "@/types/hosting-manage";
import { getServiceDisplayDomain } from "./utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/types/admin";
import { formatProductDisplayName } from "@/utils/hostingPackageOptions";

export interface ServiceDetailsCardProps {
  service: HostingServiceDetails;
  editable?: boolean;
  packageProductId?: string;
  packageOptions?: Product[];
  packageName?: string;
  domain?: string;
  serverLocation?: string;
  serverLocationOptions?: string[];
  billingCycle?: string;
  onPackageProductIdChange?: (value: string) => void;
  onPackageNameChange?: (value: string) => void;
  onDomainChange?: (value: string) => void;
  onServerLocationChange?: (value: string) => void;
  onBillingCycleChange?: (value: string) => void;
  onSaveChanges?: () => void;
  isSavingChanges?: boolean;
  disableSaveChanges?: boolean;
}

/** Read-only service details (WHMCS-style): Service Package, type, domain, billing, server. */
export function ServiceDetailsCard({
  service,
  editable = false,
  packageProductId = "",
  packageOptions = [],
  packageName = "",
  domain = "",
  serverLocation = "",
  serverLocationOptions = [],
  billingCycle = "monthly",
  onPackageProductIdChange,
  onPackageNameChange,
  onDomainChange,
  onServerLocationChange,
  onBillingCycleChange,
  onSaveChanges,
  isSavingChanges = false,
  disableSaveChanges = false,
}: ServiceDetailsCardProps) {
  const typeLabel =
    (service.productType as string) === "domain"
      ? "Domain"
      : service.productType === "email"
        ? "Email"
      : service.productType === "vps"
        ? "VPS"
        : "Hosting";

  const displayDomain = getServiceDisplayDomain(service);
  const servicePackage = formatProductDisplayName(service.packageName || service.name || "—");
  const billingCycleLabel = service.billing?.billingCycle ?? "—";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            Service Details ({typeLabel})
          </CardTitle>
          {editable && onSaveChanges ? (
            <Button size="sm" variant="outline" onClick={onSaveChanges} disabled={isSavingChanges || disableSaveChanges}>
              {isSavingChanges ? "Saving..." : "Save Details"}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Row 1: Service Package + Billing Cycle */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Service Package
          </label>
          {editable ? (
            <Select value={packageProductId || "__custom__"} onValueChange={(value) => onPackageProductIdChange?.(value === "__custom__" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select hosting package" />
              </SelectTrigger>
              <SelectContent>
                {!packageProductId ? (
                  <SelectItem value="__custom__">
                    {packageName ? formatProductDisplayName(packageName) : "Custom package name"}
                  </SelectItem>
                ) : null}
                {packageOptions.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {formatProductDisplayName(pkg.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="font-semibold">{servicePackage}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Billing cycle
          </label>
          {editable ? (
            <Select value={billingCycle} onValueChange={onBillingCycleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="semiannually">Semi-Annually</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
                <SelectItem value="biennially">Biennially</SelectItem>
                <SelectItem value="triennially">Triennially</SelectItem>
                <SelectItem value="one-time">One-Time</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="font-medium">{billingCycleLabel}</p>
          )}
        </div>

        {/* Row 2: Primary Domain + Server Location */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {typeLabel === "Domain" ? "Domain" : "Primary domain / identifier"}
          </label>
          {editable ? (
            <Input
              value={domain}
              onChange={(e) => onDomainChange?.(e.target.value)}
              className="font-mono text-sm break-all"
              spellCheck={false}
              autoComplete="off"
            />
          ) : (
            <p className="font-medium break-all">{displayDomain}</p>
          )}
        </div>
        {(service.serverLocation || editable) && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Server location
            </Label>
            {editable ? (
              <Select
                value={serverLocation || ""}
                onValueChange={(value) => onServerLocationChange?.(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select server location" />
                </SelectTrigger>
                <SelectContent>
                  {serverLocationOptions.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="font-medium">{service.serverLocation}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
