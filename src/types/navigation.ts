import type { LucideIcon } from "lucide-react";
import type { AuthUser } from "@/store/slices/authSlice";

export interface SubMenuItem {
  label: string;
  href: string;
  requiredPermissions?: string[];
  /** Nested submenu (e.g. Billable Items → Add / Recurring / Uninvoiced) */
  submenu?: SubMenuItem[];
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  hasSubmenu?: boolean;
  submenu?: SubMenuItem[];
  requiredPermissions?: string[];
}

/** Check if user has a specific permission (handles full access and resource:full) */
export function hasPermission(user: AuthUser | null, permission: string): boolean {
  if (!user) return false;
  if (user.role === "superadmin" || user.role === "admin") return true;
  if (user.roleData?.hasFullAccess) return true;
  const perms = user.roleData?.permissions ?? [];
  if (perms.includes(permission)) return true;
  const [resource] = permission.split(":");
  if (resource && perms.includes(`${resource}:full`)) return true;
  return false;
}

/** Check if user has any of the given permissions */
export function hasAnyPermission(user: AuthUser | null, permissions: string[]): boolean {
  if (!user) return false;
  if (user.role === "superadmin" || user.role === "admin") return true;
  if (user.roleData?.hasFullAccess) return true;
  return permissions.some((p) => hasPermission(user, p));
}

/** Filter nav items by user's permissions. Returns items the user can access. */
export function filterAdminNavByRole<T extends NavItem>(items: T[], user: AuthUser | null): T[] {
  if (!user) return [];
  if (user.role === "superadmin" || user.role === "admin") return items;
  if (user.roleData?.hasFullAccess) return items;

  function filterSubmenu(sub: SubMenuItem, parentPerms: string[]): SubMenuItem | null {
    const subPerms = sub.requiredPermissions ?? parentPerms;
    if (subPerms.length > 0 && !hasAnyPermission(user, subPerms)) return null;
    if (sub.submenu?.length) {
      const filteredNested = sub.submenu
        .map((n) => filterSubmenu(n, subPerms))
        .filter((n): n is SubMenuItem => n !== null);
      if (filteredNested.length === 0) return null;
      return { ...sub, submenu: filteredNested };
    }
    return sub;
  }

  return items
    .filter((item) => {
      const perms = item.requiredPermissions ?? [];
      if (perms.length === 0) return true;
      return hasAnyPermission(user, perms);
    })
    .map((item) => {
      if (!item.submenu) return item;
      const filteredSub = item.submenu
        .map((sub) => filterSubmenu(sub, item.requiredPermissions ?? []))
        .filter((s): s is SubMenuItem => s !== null);
      return { ...item, submenu: filteredSub };
    })
    .filter((item) => !item.hasSubmenu || (item.submenu && item.submenu.length > 0));
}
