import {
  Home,
  Grid3x3,
  Globe,
  Mail,
  Server,
  Share2,
  CreditCard,
  MessageSquare,
  Users,
  Shield,
} from "lucide-react";
import type { NavItem } from "@/types/navigation";
import type { GrantAccessAreas } from "@/types/grant-access";

// Demand-first order: Home → Core services → Billing/support → Growth tools → Secondary pages
export const clientNavItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Hosting",
    href: "/hosting",
    icon: Grid3x3,
  },
  {
    label: "Domains",
    href: "/domains",
    icon: Globe,
    hasSubmenu: true,
    submenu: [
      { label: "Domain portfolio", href: "/domains" },
      { label: "Get a new domain", href: "/domains/register" },
      { label: "Transfers", href: "/domains/transfers" },
    ],
  },
  {
    label: "Billing",
    href: "/billing",
    icon: CreditCard,
    hasSubmenu: true,
    submenu: [
      { label: "Invoices", href: "/invoices" },
      { label: "Billing History", href: "/billing/history" },
    ],
  },


  {
    label: "VPS",
    href: "/vps",
    icon: Server,
  },
  {
    label: "Emails",
    href: "/emails",
    icon: Mail,
  },
  {
    label: "Tickets",
    href: "/tickets",
    icon: MessageSquare,
  },
  {
    label: "Refer & Earn",
    href: "/referrals",
    icon: Share2,
  },
  {
    label: "Access",
    href: "/grant-access",
    icon: Shield,
    hasSubmenu: true,
    submenu: [
      { label: "People with access", href: "/grant-access" },
      { label: "Shared with me", href: "/shared-with-me" },
    ],
  },
  
  {
    label: "Account",
    href: "/account",
    icon: Users,
  },
];

/** Filter client nav items by grant access areas (when acting as another user). */
export function filterClientNavByAccessAreas(
  items: NavItem[],
  accessAreas: GrantAccessAreas | undefined
): NavItem[] {
  if (!accessAreas) return items;
  return items
    .filter((item) => {
      if (item.href === "/tickets") return accessAreas.tickets;
      if (item.href === "/billing") return accessAreas.invoices || accessAreas.orders;
      return true;
    })
    .map((item) => {
      if (item.href === "/billing" && item.submenu && accessAreas) {
        const submenu = item.submenu.filter(
          (s) =>
            (s.href === "/invoices" && accessAreas.invoices) ||
            (s.href === "/billing/history" && accessAreas.orders)
        );
        if (submenu.length === 0) return null;
        return { ...item, submenu };
      }
      return item;
    })
    .filter((item): item is NavItem => item != null);
}
