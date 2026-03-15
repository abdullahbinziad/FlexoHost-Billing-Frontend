"use client";

import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { GrantScope, GrantPermission, CreateGrantRequest } from "@/types/grant-access";
import type { HostingService } from "@/types/hosting";
import { SCOPE_LABELS, SERVICE_TYPES, PERMISSION_LABELS, ACCESS_AREA_LABELS } from "../constants";

export interface GrantAccessFormProps {
  /** Current client id (owner). */
  clientId: string;
  /** Services for "specific_services" scope. */
  services: HostingService[];
  onSubmit: (body: CreateGrantRequest) => Promise<void>;
  isSubmitting?: boolean;
  error: string | null;
  success: string | null;
  onClearMessage?: () => void;
}

const DEFAULT_PERMISSIONS: GrantPermission[] = ["view"];

export function GrantAccessForm({
  clientId,
  services,
  onSubmit,
  isSubmitting = false,
  error,
  success,
  onClearMessage,
}: GrantAccessFormProps) {
  const [granteeEmail, setGranteeEmail] = useState("");
  const [scope, setScope] = useState<GrantScope>("all");
  const [serviceType, setServiceType] = useState("");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<GrantPermission[]>(DEFAULT_PERMISSIONS);
  const [allowInvoices, setAllowInvoices] = useState(true);
  const [allowTickets, setAllowTickets] = useState(true);
  const [allowOrders, setAllowOrders] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");

  const togglePermission = (p: GrantPermission) => {
    setPermissions((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const toggleServiceId = (id: string) => {
    setServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setGranteeEmail("");
    setScope("all");
    setServiceType("");
    setServiceIds([]);
    setPermissions(DEFAULT_PERMISSIONS);
    setAllowInvoices(true);
    setAllowTickets(true);
    setAllowOrders(true);
    setExpiresAt("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onClearMessage?.();
    if (!granteeEmail.trim()) return;
    if (scope === "service_type" && !serviceType) return;
    if (scope === "specific_services" && serviceIds.length === 0) return;
    if (permissions.length === 0) return;

    const body: CreateGrantRequest = {
      granteeEmail: granteeEmail.trim().toLowerCase(),
      scope,
      permissions,
      allowInvoices,
      allowTickets,
      allowOrders,
      expiresAt: expiresAt ? expiresAt : undefined,
    };
    if (scope === "service_type") body.serviceType = serviceType;
    if (scope === "specific_services") body.serviceIds = serviceIds;

    await onSubmit(body);
    resetForm();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Grant access
        </CardTitle>
        <CardDescription>
          Add someone by email. They must have an account on this billing system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p
              className="text-sm text-destructive bg-destructive/10 p-2 rounded"
              role="alert"
            >
              {error}
            </p>
          )}
          {success && (
            <p
              className="text-sm text-green-600 dark:text-green-400 bg-green-500/10 p-2 rounded"
              role="status"
            >
              {success}
            </p>
          )}

          <div className="grid gap-2">
            <Label htmlFor="granteeEmail">Grantee email</Label>
            <Input
              id="granteeEmail"
              type="email"
              placeholder="user@example.com"
              value={granteeEmail}
              onChange={(e) => setGranteeEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Scope</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as GrantScope)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SCOPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {scope === "service_type" && (
            <div className="grid gap-2">
              <Label>Service type</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {scope === "specific_services" && (
            <div className="grid gap-2">
              <Label>Services (select one or more)</Label>
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                {services.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No services found.</p>
                ) : (
                  services.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={serviceIds.includes(s.id)}
                        onCheckedChange={() => toggleServiceId(s.id)}
                      />
                      <span className="text-sm">
                        {s.name || s.identifier || s.id} ({s.productType ?? "—"})
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Permissions (for services)</Label>
            <div className="flex gap-4">
              {(["view", "manage"] as GrantPermission[]).map((p) => (
                <label key={p} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={permissions.includes(p)}
                    onCheckedChange={() => togglePermission(p)}
                  />
                  <span className="text-sm">{PERMISSION_LABELS[p]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Access to (when managing this account)</Label>
            <p className="text-xs text-muted-foreground">
              Choose which areas the grantee can see and use. Services are controlled by scope above.
            </p>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={allowInvoices}
                  onCheckedChange={(c) => setAllowInvoices(c === true)}
                />
                <span className="text-sm">{ACCESS_AREA_LABELS.invoices}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={allowTickets}
                  onCheckedChange={(c) => setAllowTickets(c === true)}
                />
                <span className="text-sm">{ACCESS_AREA_LABELS.tickets}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={allowOrders}
                  onCheckedChange={(c) => setAllowOrders(c === true)}
                />
                <span className="text-sm">{ACCESS_AREA_LABELS.orders}</span>
              </label>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="expiresAt">Expires at (optional)</Label>
            <Input
              id="expiresAt"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding…
              </>
            ) : (
              "Grant access"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
