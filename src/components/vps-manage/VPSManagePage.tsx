"use client";

import { Breadcrumbs } from "@/components/hosting-manage/Breadcrumbs";
import { VPSHeader } from "./VPSHeader";
import { VPSPowerControls } from "./VPSPowerControls";
import { VPSStatsCard } from "./VPSStatsCard";
import { VPSInfoCard } from "./VPSInfoCard";
import { VPSConsolePreview } from "./VPSConsolePreview";
import { BillingOverviewCard } from "@/components/hosting-manage/BillingOverviewCard";
import type { VPSServiceDetails } from "@/types/vps-manage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Settings, HardDrive, Shield } from "lucide-react";

interface VPSManagePageProps {
    service: VPSServiceDetails;
}

export function VPSManagePage({ service }: VPSManagePageProps) {
    const breadcrumbs = [
        { label: "Portal Home", href: "/client" },
        { label: "Client Area", href: "/client" },
        { label: "Cloud VPS", href: "/vps" },
        { label: "Manage Instance" },
    ];

    const handlePowerAction = (action: string) => {
        console.log(`Sending ${action} signal to VPS ${service.id}`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Breadcrumbs */}
            <Breadcrumbs items={breadcrumbs} />

            {/* Service Header with Status */}
            <VPSHeader service={service} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

                {/* Left Column: Controls & Quick Info */}
                <div className="xl:col-span-3 space-y-6">

                    {/* Power Controls & Console Preview (Side by Side on Large) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <VPSPowerControls status={service.status} onAction={handlePowerAction} />
                            <VPSInfoCard service={service} />
                        </div>
                        <div className="h-full">
                            <VPSConsolePreview />
                        </div>
                    </div>

                    {/* Detailed Tabs */}
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
                            <TabsTrigger value="overview" className="gap-2">
                                <Activity className="w-4 h-4" /> Overview
                            </TabsTrigger>
                            <TabsTrigger value="network" className="gap-2">
                                <Shield className="w-4 h-4" /> Network
                            </TabsTrigger>
                            <TabsTrigger value="storage" className="gap-2">
                                <HardDrive className="w-4 h-4" /> Storage
                            </TabsTrigger>
                            <TabsTrigger value="settings" className="gap-2">
                                <Settings className="w-4 h-4" /> Settings
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-6 space-y-6">
                            <VPSStatsCard service={service} />
                        </TabsContent>

                        <TabsContent value="network" className="mt-6">
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 text-center text-gray-500">
                                Network Management (Firewall, rDNS) - Coming Soon
                            </div>
                        </TabsContent>

                        <TabsContent value="storage" className="mt-6">
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 text-center text-gray-500">
                                Storage Management (Snapshots, Reinstall) - Coming Soon
                            </div>
                        </TabsContent>

                        <TabsContent value="settings" className="mt-6">
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 text-center text-gray-500">
                                VPS Settings (Hostname, Password) - Coming Soon
                            </div>
                        </TabsContent>
                    </Tabs>

                </div>

                {/* Right Column: Billing & Additional Info */}
                <div className="xl:col-span-1 space-y-6">
                    <BillingOverviewCard service={service as any} />
                    {/* Could add Support Ticket widget or similar here */}
                </div>

            </div>
        </div>
    );
}
