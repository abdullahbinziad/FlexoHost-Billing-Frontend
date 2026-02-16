import type { LucideIcon } from "lucide-react";

export interface SubMenuItem {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  hasSubmenu?: boolean;
  submenu?: SubMenuItem[];
}
