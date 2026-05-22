"use client";

import { Button } from "@/components/ui/button";
import type { VPSServiceDetails } from "@/types/vps-manage";
import { Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface VPSInfoCardProps {
    service: VPSServiceDetails;
}

export function VPSInfoCard({ service }: VPSInfoCardProps) {
    const [showPassword, setShowPassword] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add toast notification here
    };

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 h-full">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Server Information
            </h3>
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                            Main IP Address
                        </label>
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-sm dark:text-gray-200">{service.ipAddress}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(service.ipAddress)}
                            >
                                <Copy className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                            Hostname
                        </label>
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-sm dark:text-gray-200 truncate pr-2">{service.hostname}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(service.hostname)}
                            >
                                <Copy className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                            Root Password
                        </label>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm dark:text-gray-200">
                                    {showPassword ? "Start123!" : "••••••••••••"}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard("Start123!")}
                            >
                                <Copy className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                                Operating System
                            </label>
                            <span className="text-sm font-medium dark:text-gray-200">{service.os}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                                Version
                            </label>
                            <span className="text-sm font-medium dark:text-gray-200">{service.osVersion}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
