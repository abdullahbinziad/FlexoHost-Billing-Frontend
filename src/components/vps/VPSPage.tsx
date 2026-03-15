"use client";

import { useRouter } from "next/navigation";
import { OrderNewHostingBanner } from "../hosting/OrderNewHostingBanner";
import { ActiveServicesList } from "../hosting/ActiveServicesList";
import { ClientServicesPageFrame } from "../hosting/ClientServicesPageFrame";
import { useClientServicesPage } from "@/hooks/useClientServicesPage";

export function VPSPage() {
  const router = useRouter();
  const { services, isLoading, isProfileLoading, noClient } = useClientServicesPage({
    type: "VPS",
    limit: 100,
  });

  const handleManage = (serviceId: string) => router.push(`/vps/${serviceId}`);
  const handleOrderNew = () => { window.location.href = "/checkout"; };

  return (
    <ClientServicesPageFrame
      isLoading={isLoading}
      isProfileLoading={isProfileLoading}
      noClient={noClient}
      loadingMessage="Loading VPS services..."
    >
      <div className="space-y-6">
        <OrderNewHostingBanner
          title="Order New VPS"
          description="High-performance KVM VPS with instant deployment."
          onOrderClick={handleOrderNew}
        />
        <h1 className="text-3xl font-bold tracking-tight">Virtual Private Servers</h1>
        <ActiveServicesList
          services={services}
          onManage={handleManage}
          title="Your Active VPS Services"
        />
      </div>
    </ClientServicesPageFrame>
  );
}
