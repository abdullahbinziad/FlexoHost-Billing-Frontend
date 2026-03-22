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
    HandCoins,
} from "lucide-react";
import type { NavItem } from "@/types/navigation";

// Standard order: Dashboard → Clients → Orders → Billing → Affiliates → Products → Support → Promotions → Domains → Server Config → Settings
// requiredPermissions: show nav if user has ANY of these (admin/superadmin bypass)
export const adminNavItems: NavItem[] = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        hasSubmenu: true,
        requiredPermissions: ["dashboard:overview", "dashboard:daily_actions", "dashboard:activity_log", "dashboard:automation"],
        submenu: [
            { label: "Overview", href: "/admin", requiredPermissions: ["dashboard:overview"] },
            { label: "Daily Actions", href: "/admin/daily-actions", requiredPermissions: ["dashboard:daily_actions"] },
            { label: "Activity Log", href: "/admin/activity-log", requiredPermissions: ["dashboard:activity_log"] },
            { label: "Automation", href: "/admin/automation", requiredPermissions: ["dashboard:automation"] },
        ],
    },
    {
        label: "Clients",
        href: "/admin/clients",
        icon: Users,
        hasSubmenu: true,
        requiredPermissions: ["clients:list", "clients:send_email"],
        submenu: [
            { label: "View / Search Client", href: "/admin/clients", requiredPermissions: ["clients:list"] },
            { label: "Compose Email", href: "/admin/emails/compose", requiredPermissions: ["clients:send_email"] },
        ],
    },
    {
        label: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
        hasSubmenu: true,
        requiredPermissions: ["orders:list", "orders:read", "orders:create"],
        submenu: [
            { label: "All Orders", href: "/admin/orders", requiredPermissions: ["orders:list", "orders:read"] },
            { label: "Add New Order", href: "/admin/orders/new", requiredPermissions: ["orders:create"] },
        ],
    },
    {
        label: "Billing",
        href: "/admin/billing/invoices",
        icon: CreditCard,
        hasSubmenu: true,
        requiredPermissions: ["invoices:list", "transactions:list"],
        submenu: [
            { label: "Invoices", href: "/admin/billing/invoices", requiredPermissions: ["invoices:list"] },
            { label: "Transactions", href: "/admin/billing/transactions", requiredPermissions: ["transactions:list"] },
            { label: "Billable Items", href: "/admin/billing/billable-items", requiredPermissions: ["invoices:list"] },
        ],
    },
  
    {
        label: "Products",
        href: "/admin/products",
        icon: Package,
        hasSubmenu: true,
        requiredPermissions: ["products:list", "products:read", "products:create"],
        submenu: [
            { label: "All Products", href: "/admin/products", requiredPermissions: ["products:list"] },
            { label: "Add Product", href: "/admin/products/add", requiredPermissions: ["products:create"] },
        ],
    },
  
    {
        label: "Support",
        href: "/admin/tickets",
        icon: MessageSquare,
        requiredPermissions: ["tickets:list", "tickets:read"],
    },
    {
        label: "Affiliates",
        href: "/admin/affiliates",
        icon: HandCoins,
        requiredPermissions: ["affiliates:dashboard"],
    },
    {
        label: "Promotions",
        href: "/admin/promotions",
        icon: Tag,
        requiredPermissions: ["promotions:list", "promotions:read"],
    },
    {
        label: "Domains",
        href: "/admin/domains",
        icon: Globe,
        hasSubmenu: true,
        requiredPermissions: ["domains:inventory_list", "domains:client_list", "domain_settings:list"],
        submenu: [
            { label: "Inventory", href: "/admin/domains", requiredPermissions: ["domains:inventory_list"] },
            { label: "Pricing", href: "/admin/domain-settings/pricing", requiredPermissions: ["domain_settings:list"] },
            { label: "Registrars", href: "/admin/domain-settings/register", requiredPermissions: ["domains:registrars_read"] },
        ],
    },
    {
        label: "Hosting Server Config",
        href: "/admin/server-config",
        icon: Server,
        requiredPermissions: ["servers:list", "servers:read"],
    },
    {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        hasSubmenu: true,
        requiredPermissions: [
            "settings:read",
            "settings:update_billing",
            "settings:smtp",
            "roles:list",
            "users:list",
            "migration:run",
        ],
        submenu: [
            { label: "Billing & Reminders", href: "/admin/settings", requiredPermissions: ["settings:read"] },
            { label: "SMTP configuration", href: "/admin/settings/smtp", requiredPermissions: ["settings:smtp"] },
            { label: "Roles", href: "/admin/roles", requiredPermissions: ["roles:list"] },
            { label: "Manage User", href: "/admin/users", requiredPermissions: ["users:list"] },
            { label: "WHMCS Migration", href: "/admin/migration", requiredPermissions: ["migration:run"] },
        ],
    },
];
