"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
    { name: "Summary", href: "" },
    { name: "Profile", href: "/profile" },
    { name: "Users", href: "/users" },
    { name: "Contacts", href: "/contacts" },
    { name: "Products/Services", href: "/products" },
    { name: "Domains", href: "/domains" },
    { name: "Billable Items", href: "/billable-items" },
    { name: "Invoices", href: "/invoices" },
    { name: "Quotes", href: "/quotes" },
    { name: "Transactions", href: "/transactions" },
    { name: "Tickets", href: "/tickets" },
    { name: "Emails", href: "/emails" },
    { name: "Notes", href: "/notes" },
    { name: "Log", href: "/log" },
];

export function ClientTabs({ clientId }: { clientId: string | number }) {
    const pathname = usePathname();
    const basePath = `/admin/clients/${clientId}`;

    return (
        <div className="border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto">
            <nav className="flex space-x-1 min-w-max px-1" aria-label="Tabs">
                {tabs.map((tab) => {
                    const href = `${basePath}${tab.href}`;
                    const isActive = pathname === href;

                    return (
                        <Link
                            key={tab.name}
                            href={href}
                            className={cn(
                                "whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                                "hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg",
                                isActive
                                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-white dark:bg-gray-900"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            )}
                        >
                            {tab.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
