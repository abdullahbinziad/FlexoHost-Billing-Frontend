"use client";

import { Badge } from "@/components/ui/badge";
import type { VPSServiceDetails } from "@/types/vps-manage";
import { Globe, Server, CheckCircle2, AlertCircle } from "lucide-react";

interface VPSHeaderProps {
    service: VPSServiceDetails;
}

export function VPSHeader({ service }: VPSHeaderProps) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            case "suspended":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            case "pending":
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "expired":
                return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${getStatusColor(service.status)} border-0 px-2 py-0.5 capitalize`}>
                        {service.status}
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {service.specs.cpu} / {service.specs.ram}
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {service.hostname}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4" />
                        <span>{service.ipAddress}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Server className="w-4 h-4" />
                        <span>{service.os} {service.osVersion}</span>
                    </div>
                </div>
            </div>
            <div>
                {/* Could put quick actions here, but will put them in a separate bar */}
            </div>
        </div>
    );
}
