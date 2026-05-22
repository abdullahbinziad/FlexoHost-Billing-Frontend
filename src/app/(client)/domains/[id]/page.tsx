"use client";

import { useParams } from "next/navigation";
import { DomainManagePage } from "@/components/client/domain-manage/DomainManagePage";
import {
  useGetDomainDetailsQuery,
  useGetAdminDomainContactsQuery,
  useGetAdminDomainDnsQuery,
} from "@/store/api/domainApi";

export default function DomainManage() {
  const params = useParams();
  const domainName = params?.id as string;

  const { data, isLoading, error } = useGetDomainDetailsQuery(domainName, {
    skip: !domainName,
  });
  const {
    data: contactsData,
    isLoading: isContactsLoading,
  } = useGetAdminDomainContactsQuery(
    { domainName },
    { skip: !domainName }
  );
  const {
    data: dnsData,
    isLoading: isDnsLoading,
  } = useGetAdminDomainDnsQuery(
    { domainName },
    { skip: !domainName }
  );

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

  if (isLoading || isContactsLoading || isDnsLoading) {
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

  const splitName = (name?: string) => {
    const clean = String(name || "").trim();
    if (!clean) return { firstName: "", lastName: "" };
    const parts = clean.split(/\s+/);
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" "),
    };
  };

  const mapContact = (contact?: {
    name?: string;
    email?: string;
    phonenum?: string;
    address1?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  }) => {
    const { firstName, lastName } = splitName(contact?.name);
    return {
      firstName,
      lastName,
      email: contact?.email || "",
      phone: contact?.phonenum || "",
      address: contact?.address1 || "",
      city: contact?.city || "",
      state: contact?.state || "",
      zipCode: contact?.zip || "",
      country: contact?.country || "",
    };
  };

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
      registrant: mapContact(contactsData?.registrant),
      admin: mapContact(contactsData?.admin),
      tech: mapContact(contactsData?.tech),
      billing: mapContact(contactsData?.billing),
    },
    dnsRecords: (dnsData ?? []).map((record, index) => ({
      id: `${record.type}-${record.name || "@"}-${index}`,
      type: (record.type || "A") as "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS",
      name: record.name || "@",
      value: record.value,
      ttl: record.ttl || 3600,
    })),
  };

  return <DomainManagePage domain={domain} domainName={domainName} />;
}
