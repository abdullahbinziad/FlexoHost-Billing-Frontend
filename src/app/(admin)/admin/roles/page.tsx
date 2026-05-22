"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useGetRolesQuery,
  useDeleteRoleMutation,
  useArchiveRoleMutation,
  useRestoreRoleMutation,
  useDuplicateRoleMutation,
  useLazyExportRoleQuery,
  type Role,
} from "@/store/api/roleApi";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  Copy,
  MoreHorizontal,
  Download,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { DataTablePagination } from "@/components/shared/DataTablePagination";

export default function RolesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [roleToArchive, setRoleToArchive] = useState<string | null>(null);

  const { data, isLoading, error } = useGetRolesQuery({
    page,
    limit: 20,
    includeArchived,
    search: search || undefined,
  });

  const [deleteRole] = useDeleteRoleMutation();
  const [archiveRole] = useArchiveRoleMutation();
  const [restoreRole] = useRestoreRoleMutation();
  const [duplicateRole] = useDuplicateRoleMutation();
  const [exportRole] = useLazyExportRoleQuery();

  const roles = data?.roles ?? [];
  const pagination = data?.pagination;

  const handleDelete = async () => {
    if (!roleToDelete) return;
    try {
      await deleteRole(roleToDelete).unwrap();
      toast.success("Role deleted");
      setRoleToDelete(null);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || "Failed to delete role");
    }
  };

  const handleArchive = async () => {
    if (!roleToArchive) return;
    try {
      await archiveRole(roleToArchive).unwrap();
      toast.success("Role archived");
      setRoleToArchive(null);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || "Failed to archive role");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreRole(id).unwrap();
      toast.success("Role restored");
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || "Failed to restore role");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const role = await duplicateRole(id).unwrap();
      toast.success("Role duplicated");
      if (role?.id || role?._id) {
        window.location.href = `/admin/roles/${role.id || role._id}/edit`;
      }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || "Failed to duplicate role");
    }
  };

  const handleExport = async (id: string) => {
    try {
      const result = await exportRole(id);
      const data = result.data;
      if (!data) throw new Error("No data");
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `role-${data.slug || id}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Role exported");
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || "Failed to export role");
    }
  };

  const getRoleId = (r: Role) => r.id || r._id || "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pagination
              ? `${pagination.totalItems} role(s), Page ${pagination.currentPage} of ${pagination.totalPages}`
              : "Loading..."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={includeArchived ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setIncludeArchived(!includeArchived);
              setPage(1);
            }}
          >
            Include archived
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex gap-2">
          <Link href="/admin/roles/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </Link>
          <Link href="/admin/roles/import">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8 w-64"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading roles...</div>
          ) : error ? (
            <div className="p-12 text-center text-destructive">
              Failed to load roles. Please try again.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
                  <TableHead className="text-primary-foreground">Name</TableHead>
                  <TableHead className="text-primary-foreground">Slug</TableHead>
                  <TableHead className="text-primary-foreground">Permissions</TableHead>
                  <TableHead className="text-primary-foreground">Users</TableHead>
                  <TableHead className="text-primary-foreground">Status</TableHead>
                  <TableHead className="text-primary-foreground w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      No roles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => {
                    const id = getRoleId(role);
                    const permCount =
                      role.hasFullAccess ? "Full" : (role.permissions?.length ?? 0).toString();
                    return (
                      <TableRow key={id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell className="font-mono text-sm">{role.slug}</TableCell>
                        <TableCell>{permCount}</TableCell>
                        <TableCell>{role.userCount ?? 0}</TableCell>
                        <TableCell>
                          {role.archived ? (
                            <Badge variant="secondary">Archived</Badge>
                          ) : role.isSystem ? (
                            <Badge variant="outline">System</Badge>
                          ) : (
                            <Badge variant="default">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Link href={`/admin/roles/${id}/edit`}>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4 text-blue-600" />
                              </Button>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  title="More actions"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDuplicate(id)}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport(id)}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Export
                                </DropdownMenuItem>
                                {!role.isSystem && (
                                  <>
                                    {role.archived ? (
                                      <DropdownMenuItem onClick={() => handleRestore(id)}>
                                        <ArchiveRestore className="w-4 h-4 mr-2" />
                                        Restore
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem
                                        onClick={() => setRoleToArchive(id)}
                                        className="text-amber-600"
                                      >
                                        <Archive className="w-4 h-4 mr-2" />
                                        Archive
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() => setRoleToDelete(id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {pagination ? (
        <DataTablePagination
          page={page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.itemsPerPage}
          currentCount={roles.length}
          itemLabel="roles"
          onPageChange={setPage}
        />
      ) : null}

      <ConfirmActionDialog
        open={!!roleToDelete}
        onOpenChange={(open) => !open && setRoleToDelete(null)}
        title="Delete role?"
        description="This action cannot be undone. The role will be permanently removed. Users must be reassigned before deleting."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />

      <ConfirmActionDialog
        open={!!roleToArchive}
        onOpenChange={(open) => !open && setRoleToArchive(null)}
        title="Archive role?"
        description="Archived roles cannot be assigned to new users. Users with this role will need to be reassigned. You can restore the role later."
        confirmLabel="Archive"
        onConfirm={handleArchive}
        destructive={false}
      />
    </div>
  );
}
