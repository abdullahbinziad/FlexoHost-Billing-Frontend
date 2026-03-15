"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AddBillableItemForm, BillableItemsList } from "@/components/admin/billable-items";
import { cn } from "@/lib/utils";

const TABS = [
    { value: "add", label: "Add Billable Item", href: "/admin/billing/billable-items?tab=add" },
    { value: "recurring", label: "Recurring Items", href: "/admin/billing/billable-items?tab=recurring" },
    { value: "uninvoiced", label: "Uninvoiced Items", href: "/admin/billing/billable-items?tab=uninvoiced" },
] as const;

function BillableItemsContent() {
    const searchParams = useSearchParams();
    const tab = (searchParams.get("tab") || "add") as (typeof TABS)[number]["value"];
    const validTab = TABS.some((t) => t.value === tab) ? tab : "add";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Billable Items
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Add one-off or recurring charges, and manage uninvoiced items.
                </p>
            </div>

            <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400 gap-0.5">
                {TABS.map((t) => (
                    <Link
                        key={t.value}
                        href={t.href}
                        className={cn(
                            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
                            validTab === t.value
                                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
                                : "hover:text-gray-900 dark:hover:text-gray-200"
                        )}
                    >
                        {t.label}
                    </Link>
                ))}
            </div>

            {validTab === "add" && (
                <AddBillableItemForm onSuccess={() => {}} />
            )}

            {validTab === "recurring" && (
                <BillableItemsList
                    recurring
                    title="Recurring Items"
                    description="Items set to recur on a schedule."
                />
            )}

            {validTab === "uninvoiced" && (
                <BillableItemsList
                    uninvoiced
                    title="Uninvoiced Items"
                    description="Items not yet invoiced."
                />
            )}
        </div>
    );
}

export default function BillableItemsPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-[500px]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            }
        >
            <BillableItemsContent />
        </Suspense>
    );
}
