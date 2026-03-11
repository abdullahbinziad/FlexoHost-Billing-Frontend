"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { OrderNewHostingBanner } from "./OrderNewHostingBanner";
import { ActiveServicesList } from "./ActiveServicesList";
import { ServicesRenewingSoonCard } from "./ServicesRenewingSoonCard";
import { useGetMyClientProfileQuery } from "@/store/api/clientApi";
import { useGetClientServicesQuery } from "@/store/api/servicesApi";
import type { ServicesRenewingSoon } from "@/types/hosting";

const RENEWING_SOON_DAYS = 30;

export function HostingPage() {
  const router = useRouter();
  const { data: client, isLoading: clientLoading } = useGetMyClientProfileQuery();
  const clientId = client?._id ?? "";

  const { data, isLoading: servicesLoading } = useGetClientServicesQuery(
    { clientId, params: { type: "HOSTING", limit: 100 } },
    { skip: !clientId }
  );

  const services = data?.services ?? [];
  const renewingSoon: ServicesRenewingSoon = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + RENEWING_SOON_DAYS * 24 * 60 * 60 * 1000);
    const soon = services.filter((s) => {
      if (s.status !== "active") return false;
      const due = s.nextDueDate ? new Date(s.nextDueDate) : null;
      return due && due <= cutoff && due >= now;
    });
    return { count: soon.length, services: soon };
  }, [services]);

  const handleManage = (serviceId: string) => {
    router.push(`/hosting/${serviceId}`);
  };

  const handleOrderNew = () => {
    window.location.href = "/checkout";
  };

  const handleRenew = () => {
    if (renewingSoon.count > 0) {
      router.push("/checkout");
    }
  };

  if (clientLoading || (clientId && servicesLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500 dark:text-gray-400">Loading hosting services...</p>
      </div>
    );
  }

  if (!clientId) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500 dark:text-gray-400">Client profile not found. Please complete your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrderNewHostingBanner onOrderClick={handleOrderNew} />

      {renewingSoon.count > 0 && (
        <ServicesRenewingSoonCard data={renewingSoon} onRenew={handleRenew} />
      )}

      <ActiveServicesList services={services} onManage={handleManage} />
    </div>
  );
}
