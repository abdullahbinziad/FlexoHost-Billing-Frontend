"use client";

import { useRouter, useParams } from "next/navigation";
import { RoleForm } from "@/components/admin/roles/RoleForm";
import { PageHeader } from "@/components/ui/page-header";
import { useGetRoleQuery, useUpdateRoleMutation } from "@/store/api/roleApi";
import { toast } from "sonner";

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: role, isLoading: loadingRole, error } = useGetRoleQuery(id);
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();

  const handleSubmit = async (data: {
    name: string;
    description: string;
    permissions: string[];
  }) => {
    try {
      await updateRole({
        id,
        data: {
          name: data.name,
          description: data.description,
          permissions: data.permissions,
        },
      }).unwrap();
      toast.success("Role updated successfully");
      router.push("/admin/roles");
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || "Failed to update role");
    }
  };

  if (loadingRole || !role) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Role"
          description="Loading..."
          breadcrumbs={[{ label: "Roles", href: "/admin/roles" }, { label: "Edit" }]}
          backHref="/admin/roles"
        />
        <div className="py-12 text-center text-muted-foreground">Loading role...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Role"
          description="Error loading role"
          breadcrumbs={[{ label: "Roles", href: "/admin/roles" }, { label: "Edit" }]}
          backHref="/admin/roles"
        />
        <div className="py-12 text-center text-destructive">Failed to load role.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit: ${role.name}`}
        description={role.description || "Update role permissions."}
        breadcrumbs={[
          { label: "Roles", href: "/admin/roles" },
          { label: role.name },
          { label: "Edit" },
        ]}
        backHref="/admin/roles"
      />

      <RoleForm
        initialData={{
          name: role.name,
          description: role.description ?? "",
          permissions: role.permissions ?? [],
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/roles")}
        isSubmitting={updating}
      />
    </div>
  );
}
