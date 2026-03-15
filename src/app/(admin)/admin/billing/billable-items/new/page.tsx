"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Redirects /admin/billing/billable-items/new to the Add Billable Item tab.
 */
export default function AddBillableItemRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/admin/billing/billable-items?tab=add");
    }, [router]);

    return (
        <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );
}
