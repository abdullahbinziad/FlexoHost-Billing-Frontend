"use client";

import { useParams } from "next/navigation";
import { DomainManagePage } from "@/components/domain-manage/DomainManagePage";
import { useGetDomainDetailsQuery } from "@/store/api/domainApi";

export default function DomainManage() {
  const params = useParams();
  const domainName = params?.id as string;

  const { data, isLoading, error } = useGetDomainDetailsQuery(domainName, {
    skip: !domainName,
  });

  if (!domainName) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Domain Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">No domain specified.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 dark:text-gray-400">Loading domain...</p>
      </div>
    );
  }

  if (error || !data?.domain) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Domain Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">
            The domain may not exist or you don&apos;t have access to it.
          </p>
        </div>
      </div>
    );
  }

  const domain = {
    id: domainName,
    name: data.domain,
    status: (data.status?.toLowerCase() ?? "active") as "active" | "expired" | "pending" | "suspended",
    expirationDate: data.expirationDate ?? "",
    autoRenewal: true,
    registrationDate: "",
    nameservers: data.nameservers ?? [],
    registrarLock: data.locked ?? true,
    sslStatus: "active" as const,
    billing: {
      firstPaymentAmount: 0,
      recurringAmount: 0,
      billingCycle: "",
      paymentMethod: "",
      registrationDate: "",
      nextDueDate: data.expirationDate ?? "",
      currency: "",
    },
    contacts: {
      registrant: { firstName: "", lastName: "", email: "", phone: "", address: "", city: "", state: "", zipCode: "", country: "" },
      admin: { firstName: "", lastName: "", email: "", phone: "", address: "", city: "", state: "", zipCode: "", country: "" },
      tech: { firstName: "", lastName: "", email: "", phone: "", address: "", city: "", state: "", zipCode: "", country: "" },
      billing: { firstName: "", lastName: "", email: "", phone: "", address: "", city: "", state: "", zipCode: "", country: "" },
    },
  };

  return <DomainManagePage domain={domain} domainName={domainName} />;
}
