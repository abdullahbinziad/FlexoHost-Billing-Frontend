"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetPermissionsQuery } from "@/store/api/roleApi";
import type { PermissionsByResource, PermissionMeta } from "@/store/api/roleApi";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

const RESOURCE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  clients: "Clients",
  users: "Users",
  affiliates: "Affiliates",
  orders: "Orders",
  invoices: "Invoices",
  transactions: "Transactions",
  products: "Products",
  tickets: "Tickets",
  promotions: "Promotions",
  domains: "Domains",
  domain_settings: "Domain Settings (TLD)",
  servers: "Servers",
  services: "Services",
  settings: "Settings",
  migration: "Migration",
  roles: "Roles",
  exchange_rate: "Exchange Rate",
  payment: "Payment",
};

export interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

interface RoleFormProps {
  initialData?: Partial<RoleFormData>;
  onSubmit: (data: RoleFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function RoleForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Save",
}: RoleFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [permissions, setPermissions] = useState<Set<string>>(
    new Set(initialData?.permissions ?? [])
  );
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["dashboard", "clients"]));

  const { data: permissionsData, isLoading } = useGetPermissionsQuery();

  const grouped = useMemo(() => {
    if (!permissionsData || typeof permissionsData !== "object") return [];
    const entries = Object.entries(permissionsData as PermissionsByResource);
    if (search.trim()) {
      const lower = search.toLowerCase();
      return entries
        .map(([resource, perms]) => {
          const filtered = perms.filter(
            (p) =>
              p.id.toLowerCase().includes(lower) ||
              p.label.toLowerCase().includes(lower)
          );
          return [resource, filtered] as [string, PermissionMeta[]];
        })
        .filter(([, p]) => p.length > 0);
    }
    return entries;
  }, [permissionsData, search]);

  const togglePermission = (id: string) => {
    setPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleResource = (resource: string, perms: PermissionMeta[]) => {
    const ids = perms.map((p) => p.id);
    const allSelected = ids.every((id) => permissions.has(id));
    setPermissions((prev) => {
      const next = new Set(prev);
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const toggleFullAccess = (resourceKey: string, perms: PermissionMeta[]) => {
    const ids = perms.map((p) => p.id);
    const fullId = `${resourceKey}:full`;
    const hasFull = permissions.has(fullId);
    setPermissions((prev) => {
      const next = new Set(prev);
      if (hasFull) {
        next.delete(fullId);
        ids.forEach((id) => next.delete(id));
      } else {
        next.add(fullId);
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleExpand = (resource: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(resource)) next.delete(resource);
      else next.add(resource);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      permissions: Array.from(permissions),
    });
  };

  const resourceLabel = (r: string) => RESOURCE_LABELS[r] ?? r;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Basic Info</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Support Agent"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this role"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Permissions</h3>
          <p className="text-sm text-muted-foreground">
            Select the permissions this role should have.
          </p>
          <div className="relative mt-2 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading permissions...
            </div>
          ) : grouped.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No permissions found.
            </div>
          ) : (
            <div className="space-y-2">
              {grouped.map(([resource, perms]) => {
                const isExp = expanded.has(resource);
                const ids = perms.map((p) => p.id);
                const allSelected = ids.every((id) => permissions.has(id));
                const resourceKey = resource.split(":")[0] ?? resource;
                const hasFull = permissions.has(`${resourceKey}:full`);

                return (
                  <div key={resource} className="border rounded-md">
                    <div
                      className="flex items-center gap-2 p-3 bg-muted/50 cursor-pointer hover:bg-muted/70"
                      onClick={() => toggleExpand(resource)}
                    >
                      {isExp ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <span className="font-medium flex-1">
                        {resourceLabel(resource)}
                      </span>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleResource(resource, perms);
                          }}
                        >
                          {allSelected || hasFull ? "Deselect all" : "Select all"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFullAccess(resourceKey, perms);
                          }}
                        >
                          {hasFull ? "Remove full" : "Full access"}
                        </Button>
                      </div>
                    </div>
                    {isExp && (
                      <div className="p-3 space-y-2">
                        {perms.map((p) => (
                          <label
                            key={p.id}
                            className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 rounded px-2 py-1"
                          >
                            <Checkbox
                              checked={permissions.has(p.id) || permissions.has(`${resourceKey}:full`)}
                              onChange={() => togglePermission(p.id)}
                              disabled={permissions.has(`${resourceKey}:full`)}
                            />
                            <span className="text-sm">{p.label}</span>
                            {p.riskLevel === "high" && (
                              <span className="text-xs text-amber-600">(high risk)</span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting || !name.trim()}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
