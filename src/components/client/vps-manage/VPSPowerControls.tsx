"use client";

import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw, Power } from "lucide-react";
import { useState } from "react";
import { SERVICE_STATUS, normalizeServiceStatus } from "@/constants/serviceStatus";

interface VPSPowerControlsProps {
    status: string;
    onAction: (action: string) => void;
}

export function VPSPowerControls({ status, onAction }: VPSPowerControlsProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleAction = async (action: string) => {
        setIsLoading(action);
        // Simulate API call
        setTimeout(() => {
            onAction(action);
            setIsLoading(null);
        }, 1000);
    };

    const isRunning = normalizeServiceStatus(status) === SERVICE_STATUS.ACTIVE;

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Power Controls
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-20 gap-2 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20"
                    disabled={isRunning || !!isLoading}
                    onClick={() => handleAction("start")}
                >
                    <Play className="w-6 h-6" />
                    Start
                </Button>
                <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-20 gap-2 hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-900/20"
                    disabled={!isRunning || !!isLoading}
                    onClick={() => handleAction("restart")}
                >
                    <RotateCcw className="w-6 h-6" />
                    Restart
                </Button>
                <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-20 gap-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                    disabled={!isRunning || !!isLoading}
                    onClick={() => handleAction("stop")}
                >
                    <Square className="w-6 h-6 fill-current" />
                    Stop
                </Button>
                <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-20 gap-2 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/40"
                    disabled={isLoading === "force-stop"}
                    onClick={() => handleAction("force-stop")}
                >
                    <Power className="w-6 h-6" />
                    Force Stop
                </Button>
            </div>
        </div>
    );
}
