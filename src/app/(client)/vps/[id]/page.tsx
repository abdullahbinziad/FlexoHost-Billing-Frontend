"use client";

import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useActiveClient } from "@/hooks/useActiveClient";
import { useGetClientServiceByIdQuery } from "@/store/api/servicesApi";
import { VPSManagePage } from "@/components/client/vps-manage/VPSManagePage";

export default function VPSManage() {
    const params = useParams();
    const id = params?.id as string;
    const { activeClientId } = useActiveClient();
    const { data: service, isLoading, isError } = useGetClientServiceByIdQuery(
      { clientId: activeClientId || "", serviceId: id },
      { skip: !activeClientId || !id }
    );

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (!service || isError) {
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

    return <VPSManagePage service={service as any} />;
}
