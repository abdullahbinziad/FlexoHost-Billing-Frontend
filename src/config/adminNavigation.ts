import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Settings,
    Globe,
    Server,
    Tag,
} from "lucide-react";
import type { NavItem } from "@/types/navigation";

export const adminNavItems: NavItem[] = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        label: "Client",
        href: "/admin/clients",
        icon: Users,
        hasSubmenu: true,
        submenu: [
            {
                label: "View / Search Client",
                href: "/admin/clients",
            },
            {
                label: "Manage User",
                href: "/admin/users",
            },
        ],
    },
    {
        label: "Order",
        href: "/admin/orders",
        icon: ShoppingCart,
        hasSubmenu: true,
        submenu: [
            {
                label: "All Order",
                href: "/admin/orders",
            },
            {
                label: "Add new Order",
                href: "/admin/orders/new",
            },
        ],
    },
    {
        label: "Services",
        href: "/admin/products",
        icon: Package,
        hasSubmenu: true,
        submenu: [
            {
                label: "Hosting",
                href: "/admin/products/hosting",
            },
            {
                label: "VPS/Dedicated",
                href: "/admin/products/server",
            },
        ],
    },
    {
        label: "Promotions",
        href: "/admin/promotions",
        icon: Tag,
    },
    {
        label: "Domains",
        href: "/admin/domain-settings",
        icon: Globe,
        hasSubmenu: true,
        submenu: [
            {
                label: "Pricing",
                href: "/admin/domain-settings/pricing",
            },
            {
                label: "Registrars",
                href: "/admin/domain-settings/register",
            },
        ],
    },
    {
        label: "Hosting Server Config",
        href: "/admin/server-config",
        icon: Server,
    },
    {
        label: "Users",
        href: "/admin/users",
        icon: Users,
    },
    {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
];
