import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Settings,
    Globe,
    Server,
    Tag,
    CreditCard,
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
        label: "Billing",
        href: "/admin/billing/invoices",
        icon: CreditCard,
        hasSubmenu: true,
        submenu: [
            {
                label: "Invoice",
                href: "/admin/billing/invoices",
            },
            {
                label: "Transaction",
                href: "/admin/billing/transactions",
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
        label: "Products",
        href: "/admin/products",
        icon: Package,
        hasSubmenu: true,
        submenu: [
            {
                label: "All Products",
                href: "/admin/products",
            },
            {
                label: "Add Products",
                href: "/admin/products/add",
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
