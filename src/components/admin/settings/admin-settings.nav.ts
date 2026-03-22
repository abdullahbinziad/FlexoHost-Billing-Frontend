import { FileText, Mail, type LucideIcon } from "lucide-react";
import type { SubMenuItem } from "@/types/navigation";

/** Settings area: routes, copy, icons, and permission gates (single source for sidebar + settings layout). */
export type AdminSettingsSectionMeta = {
    href: string;
    label: string;
    description: string;
    icon: LucideIcon;
    /** User must have at least one of these (same semantics as admin sidebar). */
    requiredPermissions: string[];
};

export const ADMIN_SETTINGS_SECTIONS: AdminSettingsSectionMeta[] = [
    {
        href: "/admin/settings",
        label: "Billing & Reminders",
        description: "Invoices, renewals, suspension, termination, and reminder schedules.",
        icon: FileText,
        requiredPermissions: ["settings:read"],
    },
    {
        href: "/admin/settings/smtp",
        label: "SMTP configuration",
        description: "Outbound mail server, encryption, and test email.",
        icon: Mail,
        requiredPermissions: ["settings:smtp"],
    },
];

/** First two entries under Settings in the main admin sidebar (Roles / Users / Migration stay in adminNavigation). */
export const ADMIN_SETTINGS_CORE_SUBMENU: SubMenuItem[] = ADMIN_SETTINGS_SECTIONS.map(
    ({ href, label, requiredPermissions }) => ({
        href,
        label,
        requiredPermissions,
    })
);
