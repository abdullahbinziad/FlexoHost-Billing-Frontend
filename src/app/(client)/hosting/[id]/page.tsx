"use client";

import { useParams } from "next/navigation";
import { HostingManagePage } from "@/components/hosting-manage/HostingManagePage";
import { mockHostingServiceDetails } from "@/data/mockHostingServiceDetails";

export default function HostingManage() {
  const params = useParams();
  const id = params?.id as string;
  const service = id ? mockHostingServiceDetails[id] : null;

  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Service Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The hosting service you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return <HostingManagePage service={service} />;
}
