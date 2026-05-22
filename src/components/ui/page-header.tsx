"use client";

import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";
import { BackButton } from "@/components/ui/back-button";

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs: BreadcrumbItem[];
    backHref?: string;
    backLabel?: string;
    showBack?: boolean;
}

export function PageHeader({
    title,
    description,
    breadcrumbs,
    backHref,
    backLabel,
    showBack = true
}: PageHeaderProps) {
    return (
        <div className="mb-6">
            {showBack && <BackButton href={backHref} label={backLabel} />}
            <Breadcrumb items={breadcrumbs} />
            <div className="mt-2">
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && (
                    <p className="text-muted-foreground mt-1">{description}</p>
                )}
            </div>
        </div>
    );
}
