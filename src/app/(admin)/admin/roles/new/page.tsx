"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RoleForm } from "@/components/admin/roles/RoleForm";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateRoleMutation, useGetPresetsQuery } from "@/store/api/roleApi";
import { toast } from "sonner";

export default function NewRolePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createRole, { isLoading }] = useCreateRoleMutation();
  const { data: presets } = useGetPresetsQuery();
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [presetInitialData, setPresetInitialData] = useState<{
    name: string;
    description: string;
    permissions: string[];
  } | null>(null);

  useEffect(() => {
    const presetId = searchParams.get("preset");
    const name = searchParams.get("name");
    const permsJson = searchParams.get("permissions");
    if (presetId && presets) {
      const preset = presets.find((p) => p.id === presetId || p.name === presetId);
      if (preset) {
        setSelectedPreset(presetId);
        setPresetInitialData({
          name: name ?? preset.name,
          description: preset.description ?? "",
          permissions: permsJson ? JSON.parse(permsJson) : preset.permissions ?? [],
        });
      }
    }
  }, [searchParams, presets]);

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    if (presetId && presets) {
      const preset = presets.find((p) => p.id === presetId || p.name === presetId);
      if (preset) {
        setPresetInitialData({
          name: preset.name,
          description: preset.description ?? "",
          permissions: preset.permissions ?? [],
        });
      } else {
        setPresetInitialData(null);
      }
    } else {
      setPresetInitialData(null);
    }
  };

  const handleSubmit = async (data: {
    name: string;
    description: string;
    permissions: string[];
  }) => {
    try {
      await createRole({
        name: data.name,
        description: data.description,
        permissions: data.permissions,
      }).unwrap();
      toast.success("Role created successfully");
      router.push("/admin/roles");
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || "Failed to create role");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Role"
        description="Define a new role with specific permissions."
        breadcrumbs={[
          { label: "Roles", href: "/admin/roles" },
          { label: "Create" },
        ]}
        backHref="/admin/roles"
      />

      {presets && presets.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Create from preset:</span>
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select preset" />
            </SelectTrigger>
            <SelectContent>
              {presets.map((p) => (
                <SelectItem key={p.id ?? p.name} value={p.id ?? p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <RoleForm
        key={selectedPreset || "empty"}
        initialData={presetInitialData ?? undefined}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/roles")}
        isSubmitting={isLoading}
        submitLabel="Create Role"
      />
    </div>
  );
}
