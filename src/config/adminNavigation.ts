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
    MessageSquare,
} from "lucide-react";
import type { NavItem } from "@/types/navigation";

// Standard order: Dashboard → Clients → Orders → Billing → Products → Support → Promotions → Domains → Server Config → Settings
export const adminNavItems: NavItem[] = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        label: "Clients",
        href: "/admin/clients",
        icon: Users,
        hasSubmenu: true,
        submenu: [
            { label: "View / Search Client", href: "/admin/clients" },
            { label: "Manage User", href: "/admin/users" },
        ],
    },
    {
        label: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
        hasSubmenu: true,
        submenu: [
            { label: "All Orders", href: "/admin/orders" },
            { label: "Add New Order", href: "/admin/orders/new" },
        ],
    },
    {
        label: "Billing",
        href: "/admin/billing/invoices",
        icon: CreditCard,
        hasSubmenu: true,
        submenu: [
            { label: "Invoices", href: "/admin/billing/invoices" },
            { label: "Transactions", href: "/admin/billing/transactions" },
        ],
    },
    {
        label: "Products",
        href: "/admin/products",
        icon: Package,
        hasSubmenu: true,
        submenu: [
            { label: "All Products", href: "/admin/products" },
            { label: "Add Product", href: "/admin/products/add" },
        ],
    },
    {
        label: "Support",
        href: "/admin/tickets",
        icon: MessageSquare,
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
            { label: "Pricing", href: "/admin/domain-settings/pricing" },
            { label: "Registrars", href: "/admin/domain-settings/register" },
        ],
    },
    {
        label: "Hosting Server Config",
        href: "/admin/server-config",
        icon: Server,
    },
    {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
];
