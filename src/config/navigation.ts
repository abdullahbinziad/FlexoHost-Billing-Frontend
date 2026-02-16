import {
  Home,
  Grid3x3,
  Globe,
  Mail,
  Server,
  CreditCard,
  Layers,
  MessageSquare,
  FileText,
  Users,
} from "lucide-react";
import type { NavItem } from "@/types/navigation";

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
      {
        label: "Domain portfolio",
        href: "/domains",
      },
      {
        label: "Get a new domain",
        href: "/domains/register",
      },
      {
        label: "Transfers",
        href: "/domains/transfers",
      },
    ],
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
    label: "VPS",
    href: "/vps",
    icon: Server,
  },
  {
    label: "Billing",
    href: "/billing",
    icon: CreditCard,
    hasSubmenu: true,
    submenu: [
      {
        label: "Payment Methods",
        href: "/billing/payment-methods",
      },
      {
        label: "Billing History",
        href: "/billing/history",
      },
    ],
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    label: "All Services",
    href: "/all-services",
    icon: Layers,
    badge: "New",
  },
  {
    label: "Account",
    href: "/account",
    icon: Users,
  },
];
