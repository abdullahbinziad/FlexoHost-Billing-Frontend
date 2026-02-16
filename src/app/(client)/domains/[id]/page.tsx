"use client";

import { useParams } from "next/navigation";
import { DomainManagePage } from "@/components/domain-manage/DomainManagePage";
import { mockDomainDetails } from "@/data/mockDomainDetails";

export default function DomainManage() {
  const params = useParams();
  const id = params?.id as string;
  const domain = id ? mockDomainDetails[id] : null;

  if (!domain) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Domain Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The domain you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return <DomainManagePage domain={domain} />;
}
