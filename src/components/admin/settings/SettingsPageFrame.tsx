"use client";

import type { ReactNode } from "react";

type SettingsPageFrameProps = {
    title: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
};

/**
 * Consistent header + optional actions for pages under /admin/settings/*.
 */
export function SettingsPageFrame({ title, description, actions, children }: SettingsPageFrameProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                    {description ? (
                        <p className="text-muted-foreground text-sm mt-0.5 max-w-2xl">{description}</p>
                    ) : null}
                </div>
                {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
            </div>
            {children}
        </div>
    );
}
