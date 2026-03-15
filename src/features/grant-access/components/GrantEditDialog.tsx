"use client";

import { useState, useEffect } from "react";
import { Loader2, Pencil } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { AccessGrant, GrantScope, GrantPermission, UpdateGrantRequest } from "@/types/grant-access";
import type { HostingService } from "@/types/hosting";
import { formatGrantee } from "../utils";
import { SCOPE_LABELS, SERVICE_TYPES, PERMISSION_LABELS, ACCESS_AREA_LABELS } from "../constants";

export interface GrantEditDialogProps {
  grant: AccessGrant | null;
  /** When null, dialog is closed. */
  clientId: string;
  services: HostingService[];
  onClose: () => void;
  onSubmit: (body: UpdateGrantRequest) => Promise<void>;
  isSubmitting?: boolean;
  error: string | null;
  onClearError?: () => void;
}

export function GrantEditDialog({
  grant,
  clientId,
  services,
  onClose,
  onSubmit,
  isSubmitting = false,
  error,
  onClearError,
}: GrantEditDialogProps) {
  const [scope, setScope] = useState<GrantScope>("all");
  const [serviceType, setServiceType] = useState("");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<GrantPermission[]>(["view"]);
  const [allowInvoices, setAllowInvoices] = useState(true);
  const [allowTickets, setAllowTickets] = useState(true);
  const [allowOrders, setAllowOrders] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    if (!grant) return;
    setScope(grant.scope ?? "all");
    setServiceType(grant.serviceType ?? "");
    setServiceIds(Array.isArray(grant.serviceIds) ? grant.serviceIds.map((id) => (typeof id === "string" ? id : (id as any)._id ?? id)) : []);
    setPermissions(Array.isArray(grant.permissions) && grant.permissions.length ? grant.permissions : ["view"]);
    setAllowInvoices(grant.allowInvoices !== false);
    setAllowTickets(grant.allowTickets !== false);
    setAllowOrders(grant.allowOrders !== false);
    setExpiresAt(grant.expiresAt ? grant.expiresAt.slice(0, 10) : "");
  }, [grant]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onClearError?.();
    if (!grant) return;
    if (scope === "service_type" && !serviceType) return;
    if (scope === "specific_services" && serviceIds.length === 0) return;
    if (permissions.length === 0) return;

    const body: UpdateGrantRequest = {
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
    onClose();
  };

  if (!grant) return null;

  return (
    <Dialog open={!!grant} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            Edit access
          </DialogTitle>
          <DialogDescription>
            Updating access for <span className="font-medium text-foreground">{formatGrantee(grant)}</span>. Grantee cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded" role="alert">
              {error}
            </p>
          )}

          <div className="grid gap-2">
            <Label>Grantee</Label>
            <Input value={formatGrantee(grant)} disabled className="bg-muted" />
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
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer">
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
            <Label htmlFor="edit-expiresAt">Expires at (optional)</Label>
            <Input
              id="edit-expiresAt"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
