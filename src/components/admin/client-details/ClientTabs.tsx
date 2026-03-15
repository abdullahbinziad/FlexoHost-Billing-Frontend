"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
    { name: "Summary", href: "" },
    { name: "Profile", href: "/profile" },
    { name: "Hosting", href: "/hosting", group: "service" },
    { name: "VPS", href: "/vps", group: "service" },
    { name: "Email Services", href: "/email-services", group: "service" },
    { name: "Domains", href: "/domains", group: "service" },
    { name: "Invoices", href: "/invoices" },
    { name: "Tickets", href: "/tickets" },
    { name: "Transactions", href: "/transactions" },
    { name: "Emails", href: "/emails" },
    { name: "Log", href: "/log" },
    { name: "Contacts", href: "/contacts" },
    { name: "Users", href: "/users" },
    { name: "Affiliate", href: "/affiliate" },
    { name: "Billable Items", href: "/billable-items", comingSoon: true },
    { name: "Quotes", href: "/quotes", comingSoon: true },
    { name: "Notes", href: "/notes", comingSoon: true },
];

export function ClientTabs({ clientId }: { clientId: string | number }) {
    const pathname = usePathname();
    const basePath = `/admin/clients/${clientId}`;

    return (
        <div className="border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto">
            <nav className="flex space-x-1 min-w-max px-1" aria-label="Tabs">
                {tabs.map((tab) => {
                    const href = `${basePath}${tab.href}`;
                    const isActive = tab.href
                        ? pathname === href || pathname.startsWith(`${href}/`)
                        : pathname === basePath;

                    return (
                        <Link
                            key={tab.name}
                            href={href}
                            className={cn(
                                "whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors inline-flex items-center gap-2",
                                "rounded-t-lg",
                                tab.group === "service"
                                    ? "bg-blue-50/70 text-blue-700 hover:bg-blue-100/80 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-900/40"
                                    : "hover:bg-gray-50 dark:hover:bg-gray-800",
                                isActive
                                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-white dark:bg-gray-900"
                                    : tab.group === "service"
                                        ? "border-blue-200/70 dark:border-blue-900/40"
                                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            )}
                        >
                            {tab.name}
                            {tab.comingSoon ? (
                                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                                    Coming soon
                                </span>
                            ) : null}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
