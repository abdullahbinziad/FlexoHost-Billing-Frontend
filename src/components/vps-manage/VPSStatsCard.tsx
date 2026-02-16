"use client";

import { Progress } from "@/components/ui/progress";
import type { VPSServiceDetails } from "@/types/vps-manage";
import { Cpu, HardDrive, Zap, Network } from "lucide-react";

interface VPSStatsCardProps {
    service: VPSServiceDetails;
}

export function VPSStatsCard({ service }: VPSStatsCardProps) {
    const { usage, specs } = service;

    const ramPercentage = (usage.ram.used / usage.ram.total) * 100;
    const diskPercentage = (usage.disk.used / usage.disk.total) * 100;
    const bandwidthPercentage = (usage.bandwidth.used / usage.bandwidth.total) * 100;

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Resource Usage
            </h3>
            <div className="space-y-6">
                {/* CPU */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Cpu className="w-4 h-4" />
                            <span>CPU Usage</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{usage.cpuUsage}%</span>
                    </div>
                    <Progress value={usage.cpuUsage} className="h-2" />
                    <p className="text-xs text-right text-gray-500">{specs.cpu}</p>
                </div>

                {/* RAM */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Zap className="w-4 h-4" />
                            <span>RAM</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {usage.ram.used}MB / {specs.ram}
                        </span>
                    </div>
                    <Progress value={ramPercentage} className="h-2" />
                </div>

                {/* Disk */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <HardDrive className="w-4 h-4" />
                            <span>Disk</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {usage.disk.used}GB / {specs.storage}
                        </span>
                    </div>
                    <Progress value={diskPercentage} className="h-2" />
                </div>

                {/* Bandwidth */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Network className="w-4 h-4" />
                            <span>Bandwidth</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {usage.bandwidth.used}TB / {specs.bandwidth}
                        </span>
                    </div>
                    <Progress value={bandwidthPercentage} className="h-2" />
                </div>
            </div>
        </div>
    );
}
