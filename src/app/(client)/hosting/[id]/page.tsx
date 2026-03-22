"use client";

import { useParams } from "next/navigation";
import { HostingManagePage } from "@/components/client/hosting-manage/HostingManagePage";
import { useActiveClient } from "@/hooks/useActiveClient";
import { useGetClientServiceByIdQuery } from "@/store/api/servicesApi";

export default function HostingManage() {
  const params = useParams();
  const id = params?.id as string;

  const { activeClientId, isProfileLoading } = useActiveClient();
  const clientId = activeClientId ?? "";

  const { data: service, isLoading, isError } = useGetClientServiceByIdQuery(
    { clientId, serviceId: id },
    { skip: !clientId || !id }
  );

  if (isProfileLoading && !clientId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!clientId || !id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Invalid Request
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Missing client or service identifier.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 dark:text-gray-400">Loading service...</p>
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Service Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The hosting service you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
        </div>
      </div>
    );
  }

  return <HostingManagePage clientId={clientId} service={service} />;
}
