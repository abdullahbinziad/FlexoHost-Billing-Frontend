"use client";

import { useParams } from "next/navigation";
import { VPSManagePage } from "@/components/vps-manage/VPSManagePage";
import { mockVPSServiceDetails } from "@/data/mockVPSServiceDetails";

export default function VPSManage() {
    const params = useParams();
    const id = params?.id as string;
    const service = id ? mockVPSServiceDetails[id] : null;

    if (!service) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        VPS Not Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        The VPS instance you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to access it.
                    </p>
                </div>
            </div>
        );
    }

    return <VPSManagePage service={service} />;
}
