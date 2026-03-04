"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { OrderNewHostingBanner } from "../hosting/OrderNewHostingBanner";
import { ActiveServicesList } from "../hosting/ActiveServicesList";
import { mockHostingServices } from "@/data/mockHostingServices";

export function VPSPage() {
    const router = useRouter();

    // Filter for VPS only
    const vpsServices = mockHostingServices.filter(s => s.productType === "vps");

    const handleManage = (serviceId: string) => {
        // Navigate to VPS management page
        router.push(`/vps/${serviceId}`);
    };

    const handleOrderNew = () => {
        // Navigate to checkout or product selection
        window.location.href = "/checkout";
    };

    return (
        <div className="space-y-6">
            {/* Reusing Banner but ideally should be customized for VPS */}
            <OrderNewHostingBanner
                title="Order New VPS"
                description="High-performance KVM VPS with instant deployment."
                onOrderClick={handleOrderNew}
            />

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Virtual Private Servers</h1>
            </div>

            {/* Active Services List */}
            <ActiveServicesList services={vpsServices} onManage={handleManage} />
        </div>
    );
}
