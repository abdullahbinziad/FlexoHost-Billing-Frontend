"use client";

import { cn } from "@/lib/utils";

export type AdminInvoiceTabId = "summary" | "add-payment" | "options" | "credit" | "refund" | "notes";

const TABS: { id: AdminInvoiceTabId; label: string }[] = [
    { id: "summary", label: "Summary" },
    { id: "add-payment", label: "Add Payment" },

    { id: "credit", label: "Credit" },
    { id: "refund", label: "Refund" },
    { id: "notes", label: "Notes" },
];

interface AdminInvoiceTabsProps {
    activeTab: AdminInvoiceTabId;
    onTabChange: (tab: AdminInvoiceTabId) => void;
}

export function AdminInvoiceTabs({ activeTab, onTabChange }: AdminInvoiceTabsProps) {
    return (
        <div className="border-b border-border">
            <nav className="flex gap-1 -mb-px" aria-label="Invoice tabs">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "px-4 py-3 text-sm font-medium transition-colors border-b-2",
                                isActive
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                            )}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
