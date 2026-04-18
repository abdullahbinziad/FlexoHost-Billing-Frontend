"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsPageFrame } from "@/components/admin/settings";
import {
  useGetAdminRegistrarConfigsQuery,
  useGetDomainSystemDefaultsQuery,
  useUpdateDomainSystemDefaultsMutation,
  type DomainSystemSettingsDto,
} from "@/store/api/domainApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { hasPermission } from "@/types/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const emptyForm: DomainSystemSettingsDto = {
  defaultRegistrarKey: "dynadot",
  nameserver1: "",
  nameserver2: "",
  nameserver3: "",
  nameserver4: "",
};

export default function AdminDomainDefaultsPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const canUpdate = hasPermission(user, "domain_settings:defaults_update");

  const { data, isLoading, error } = useGetDomainSystemDefaultsQuery();
  const { data: registrars = [] } = useGetAdminRegistrarConfigsQuery();
  const [updateDefaults, { isLoading: isSaving }] = useUpdateDomainSystemDefaultsMutation();

  const [form, setForm] = useState<DomainSystemSettingsDto>(emptyForm);

  const implementedRegistrars = useMemo(
    () => registrars.filter((r) => r.implemented),
    [registrars]
  );

  useEffect(() => {
    if (data) {
      setForm({ ...emptyForm, ...data });
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updateDefaults(form).unwrap();
      toast.success("Domain defaults saved");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : "Failed to save";
      toast.error(msg ?? "Failed to save");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        You may not have permission to view domain defaults, or the request failed.
      </div>
    );
  }

  return (
    <SettingsPageFrame
      title="Domain defaults"
      description="Default registrar when a TLD has no provider, and up to four fallback nameservers used when an order does not specify at least two hosts (same behavior as former environment variables)."
      actions={
        <Button type="button" onClick={handleSave} disabled={!canUpdate || isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Registrar &amp; nameservers</CardTitle>
          <CardDescription>
            Choose a default registrar implementation and optional nameservers. Leave nameservers empty to rely on
            each registrar&apos;s own defaults during registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 max-w-md">
            <Label htmlFor="defaultRegistrarKey">Default registrar key</Label>
            <Select
              value={form.defaultRegistrarKey}
              onValueChange={(v) => setForm((f) => ({ ...f, defaultRegistrarKey: v }))}
              disabled={!canUpdate}
            >
              <SelectTrigger id="defaultRegistrarKey">
                <SelectValue placeholder="Select registrar" />
              </SelectTrigger>
              <SelectContent>
                {implementedRegistrars.map((r) => (
                  <SelectItem key={r.key} value={r.key}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Used when static TLD map and Mongo TLD have no provider. Must match an implemented registrar.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {([1, 2, 3, 4] as const).map((n) => {
              const key = `nameserver${n}` as keyof DomainSystemSettingsDto;
              return (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>Nameserver {n}</Label>
                  <Input
                    id={key}
                    value={form[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={n <= 2 ? `ns${n}.example.com` : "Optional"}
                    disabled={!canUpdate}
                    autoComplete="off"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </SettingsPageFrame>
  );
}
