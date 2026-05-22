import type { LucideIcon } from "lucide-react";
import type { AuthUser } from "@/store/slices/authSlice";
import { USER_ROLES } from "@/config/api";

/** Normalize API role (slug/name) to frontend role used for guards and nav */
export function normalizeRole(role: unknown): string {
  if (typeof role !== "string" || !role) return "";
  const r = role.trim().toLowerCase();
  if (r === "superadmin" || r === "super_admin") return USER_ROLES.SUPERADMIN;
  if (r === "admin") return USER_ROLES.ADMIN;
  if (r === "staff") return USER_ROLES.STAFF;
  if (r === "client") return USER_ROLES.CLIENT;
  if (r === "user") return USER_ROLES.USER;
  if (r === "moderator") return USER_ROLES.MODERATOR;
  return r;
}

export interface SubMenuItem {
  label: string;
  href: string;
  badge?: string;
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
  const role = normalizeRole(user.role);
  if (role === USER_ROLES.SUPERADMIN || role === USER_ROLES.ADMIN) return true;
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
  const role = normalizeRole(user.role);
  if (role === USER_ROLES.SUPERADMIN || role === USER_ROLES.ADMIN) return true;
  if (user.roleData?.hasFullAccess) return true;
  return permissions.some((p) => hasPermission(user, p));
}

/** Filter nav items by user's permissions. Returns items the user can access. */
export function filterAdminNavByRole<T extends NavItem>(items: T[], user: AuthUser | null): T[] {
  if (!user) return [];
  const role = normalizeRole(user.role);
  if (role === USER_ROLES.SUPERADMIN || role === USER_ROLES.ADMIN) return items;
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
