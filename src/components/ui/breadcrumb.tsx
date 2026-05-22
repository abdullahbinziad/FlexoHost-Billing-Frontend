"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Link
                href="/admin"
                className="flex items-center hover:text-foreground transition-colors"
            >
                <Home className="w-4 h-4" />
            </Link>

            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <div key={index} className="flex items-center space-x-2">
                        <ChevronRight className="w-4 h-4" />
                        {item.href && !isLast ? (
                            <Link
                                href={item.href}
                                className="hover:text-foreground transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className={isLast ? "text-foreground font-medium" : ""}>
                                {item.label}
                            </span>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
