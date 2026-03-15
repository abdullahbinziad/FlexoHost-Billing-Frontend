"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetRolesQuery } from "@/store/api/roleApi";
import type { BillingSettings } from "@/store/api/settingsApi";

interface DefaultStaffRoleCardProps {
  form: BillingSettings;
  onChange: (key: keyof BillingSettings, value: string | null) => void;
}

export function DefaultStaffRoleCard({ form, onChange }: DefaultStaffRoleCardProps) {
  const { data } = useGetRolesQuery({ includeArchived: false });
  const roles = (data?.roles ?? []).filter(
    (r) => r.slug !== "super_admin" && r.slug !== "admin"
  );

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold">Staff Default Role</h3>
        <p className="text-xs text-muted-foreground">
          When assigning a user to staff without selecting a role, this role will be used.
        </p>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Default role for new staff</Label>
          <Select
            value={form.defaultStaffRoleId ?? "__none__"}
            onValueChange={(v) => onChange("defaultStaffRoleId", v === "__none__" ? null : v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="None (no auto-assign)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {roles.map((r) => {
                const rid = String(r.id ?? r._id ?? "");
                return (
                  <SelectItem key={rid} value={rid}>
                    {r.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
