"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useBulkAssignRoleMutation,
  useDeleteUserMutation,
  type AdminUser,
} from "@/store/api/userApi";
import { useGetRolesQuery } from "@/store/api/roleApi";
import { RootState } from "@/store";
import { Search, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";

export default function AdminUsersPage() {
  const currentUserRole = useSelector((s: RootState) => s.auth?.user?.role ?? "");
  const isSuperadmin = currentUserRole === "superadmin";

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRoleId, setBulkRoleId] = useState<string>("");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const { data, isLoading, error } = useGetUsersQuery({
    page,
    limit: 20,
    role: roleFilter || undefined,
  });

  const { data: rolesData } = useGetRolesQuery({ includeArchived: false });
  const roles = rolesData?.roles ?? [];

  const [updateUser] = useUpdateUserMutation();
  const [bulkAssignRole] = useBulkAssignRoleMutation();
  const [deleteUser] = useDeleteUserMutation();

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  const rolesForDropdown = isSuperadmin
    ? roles
    : roles.filter((r) => r.slug !== "super_admin");

  const handleRoleChange = async (userId: string, roleId: string) => {
    try {
      await updateUser({ id: userId, data: { roleId } }).unwrap();
      toast.success("Role updated");
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || "Failed to update role");
    }
  };

  const handleBulkAssign = async () => {
    if (!bulkRoleId || selectedIds.size === 0) return;
    try {
      const result = await bulkAssignRole({
        userIds: Array.from(selectedIds),
        roleId: bulkRoleId,
      }).unwrap();
      toast.success(`Role assigned to ${result.updated} user(s)`);
      setSelectedIds(new Set());
      setShowBulkModal(false);
      setBulkRoleId("");
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || "Failed to assign role");
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete).unwrap();
      toast.success("User deactivated");
      setUserToDelete(null);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || "Failed to deactivate user");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id ?? u._id ?? "").filter(Boolean)));
    }
  };

  const getUserId = (u: AdminUser) => u.id ?? u._id ?? "";
  const isTargetSuperadmin = (u: AdminUser) =>
    u.role === "superadmin" || u.roleData?.name === "Super Admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage admin and staff users. Assign roles to control permissions.
        </p>
      </div>

      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Select value={roleFilter || "__all__"} onValueChange={(v) => { setRoleFilter(v === "__all__" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All roles</SelectItem>
              {rolesForDropdown.map((r) => {
                const filterVal = r.slug === "super_admin" ? "superadmin" : r.slug ?? "";
                return (
                  <SelectItem key={r.id ?? r._id} value={filterVal}>
                    {r.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        {selectedIds.size > 0 && (
          <Button onClick={() => setShowBulkModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Assign role to {selectedIds.size} user(s)
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading users...</div>
          ) : error ? (
            <div className="p-12 text-center text-destructive">
              Failed to load users. Please try again.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
                  <TableHead className="text-primary-foreground w-10">
                    <Checkbox
                      checked={selectedIds.size === users.length && users.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-primary-foreground">Email</TableHead>
                  <TableHead className="text-primary-foreground">Role</TableHead>
                  <TableHead className="text-primary-foreground">Status</TableHead>
                  <TableHead className="text-primary-foreground w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const id = getUserId(user);
                    const isSuperadminUser = isTargetSuperadmin(user);
                    const canDelete = isSuperadmin || !isSuperadminUser;

                    return (
                      <TableRow key={id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(id)}
                            onCheckedChange={() => toggleSelect(id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Select
                            value={String(user.roleId ?? "")}
                            onValueChange={(v) => handleRoleChange(id, v)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {rolesForDropdown.map((r) => {
                                const rid = String(r.id ?? r._id ?? "");
                                return (
                                  <SelectItem key={rid} value={rid}>
                                    {r.name}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.active ? "default" : "secondary"}>
                            {user.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {canDelete ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              title="Deactivate"
                              onClick={() => setUserToDelete(id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Only superadmin can delete
                            </span>
                          )}
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

      {pages > 1 && (
        <DataTablePagination
          page={page}
          totalPages={pages}
          totalItems={total}
          pageSize={20}
          currentCount={users.length}
          itemLabel="users"
          onPageChange={setPage}
        />
      )}

      <ConfirmActionDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        title="Deactivate user?"
        description="This action cannot be undone. The user will be deactivated and cannot log in."
        confirmLabel="Deactivate"
        onConfirm={handleDelete}
      />

      <AlertDialog open={showBulkModal} onOpenChange={setShowBulkModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign role to {selectedIds.size} user(s)</AlertDialogTitle>
            <AlertDialogDescription>
              Select the role to assign to all selected users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={bulkRoleId} onValueChange={setBulkRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {rolesForDropdown.map((r) => {
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
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkAssign} disabled={!bulkRoleId}>
              Assign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
