"use client";

import type { ReactNode } from "react";
import { AdminSettingsSubNav } from "@/components/admin/settings";

export default function AdminSettingsLayout({ children }: { children: ReactNode }) {
    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground text-sm max-w-2xl">
                    Billing automation, email delivery, and related admin configuration. Use the tabs below to switch
                    sections.
                </p>
            </header>
            <AdminSettingsSubNav />
            <div className="min-w-0">{children}</div>
        </div>
    );
}
