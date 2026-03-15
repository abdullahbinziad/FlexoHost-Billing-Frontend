"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useImportRoleMutation } from "@/store/api/roleApi";
import { toast } from "sonner";

export default function ImportRolePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importRole, { isLoading }] = useImportRoleMutation();
  const [jsonInput, setJsonInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonInput) as {
        name: string;
        slug?: string;
        permissions: string[];
        description?: string;
      };
      if (!parsed.name || !Array.isArray(parsed.permissions)) {
        toast.error("Invalid format: name and permissions array required");
        return;
      }
      const data = {
        name: parsed.name,
        slug: parsed.slug ?? parsed.name.toLowerCase().replace(/\s+/g, "-"),
        permissions: parsed.permissions,
        description: parsed.description,
      };
      const role = await importRole(data).unwrap();
      toast.success("Role imported successfully");
      router.push(`/admin/roles/${role.id || role._id}/edit`);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      if (e?.data?.message) {
        toast.error(e.data.message);
      } else {
        toast.error("Invalid JSON or failed to import");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setJsonInput(String(reader.result ?? ""));
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import Role"
        description="Import a role from JSON. Paste the content below or upload a file."
        breadcrumbs={[
          { label: "Roles", href: "/admin/roles" },
          { label: "Import" },
        ]}
        backHref="/admin/roles"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="json">JSON content</Label>
          <Textarea
            id="json"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='{"name":"My Role","permissions":["clients:list","clients:read"],"description":"Optional"}'
            rows={12}
            className="font-mono text-sm mt-1"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading || !jsonInput.trim()}>
            {isLoading ? "Importing..." : "Import"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/roles")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload file
          </Button>
        </div>
      </form>
    </div>
  );
}
