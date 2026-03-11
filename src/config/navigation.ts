import {
  Home,
  Grid3x3,
  Globe,
  Mail,
  Server,
  CreditCard,
  Layers,
  MessageSquare,
  Users,
} from "lucide-react";
import type { NavItem } from "@/types/navigation";

// Standard order: Home → Services (Hosting, VPS, Domains, Emails, All Services) → Billing → Support → Account
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
    label: "VPS",
    href: "/vps",
    icon: Server,
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
    label: "Emails",
    href: "/emails",
    icon: Mail,
  },
  {
    label: "All Services",
    href: "/all-services",
    icon: Layers,
    badge: "New",
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
    label: "Tickets",
    href: "/tickets",
    icon: MessageSquare,
  },
  {
    label: "Account",
    href: "/account",
    icon: Users,
  },
];
