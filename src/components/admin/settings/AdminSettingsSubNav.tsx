"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { cn } from "@/lib/utils";
import { ADMIN_SETTINGS_SECTIONS } from "./admin-settings.nav";
import { hasAnyPermission } from "@/types/navigation";
import type { RootState } from "@/store";

/**
 * Secondary navigation for /admin/settings/* (reusable, permission-aware).
 */
export function AdminSettingsSubNav() {
    const pathname = usePathname();
    const user = useSelector((s: RootState) => s.auth?.user ?? null);

    const visible = ADMIN_SETTINGS_SECTIONS.filter(
        (s) => !s.requiredPermissions?.length || hasAnyPermission(user, s.requiredPermissions)
    );

    if (visible.length <= 1) {
        return null;
    }

    return (
        <nav className="flex flex-wrap gap-2 border-b pb-3" aria-label="Settings sections">
            {visible.map((section) => {
                const active =
                    pathname === section.href ||
                    (section.href !== "/admin/settings" && pathname?.startsWith(section.href + "/"));
                const Icon = section.icon;
                return (
                    <Link
                        key={section.href}
                        href={section.href}
                        className={cn(
                            "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                            active
                                ? "border-primary bg-primary/5 text-foreground"
                                : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                        {section.label}
                    </Link>
                );
            })}
        </nav>
    );
}
