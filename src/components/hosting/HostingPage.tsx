"use client";

import { useRouter } from "next/navigation";
import { OrderNewHostingBanner } from "./OrderNewHostingBanner";
import { ActiveServicesList } from "./ActiveServicesList";
import { ServicesRenewingSoonCard } from "./ServicesRenewingSoonCard";
import { mockHostingServices, mockServicesRenewingSoon } from "@/data/mockHostingServices";
import type { ServicesRenewingSoon } from "@/types/hosting";

export function HostingPage() {
  const router = useRouter();

  // Static data for frontend development
  // TODO: Replace with Redux/RTK Query when backend is ready
  const services = mockHostingServices;
  const renewingSoon: ServicesRenewingSoon = {
    count: mockServicesRenewingSoon.length,
    services: mockServicesRenewingSoon,
  };

  const handleManage = (serviceId: string) => {
    // Navigate to service management page
    router.push(`/hosting/${serviceId}`);
  };

  const handleOrderNew = () => {
    // TODO: Navigate to checkout or product selection
    window.location.href = "/checkout";
  };

  const handleRenew = () => {
    // TODO: Navigate to renewal page or open renewal modal
    console.log("Renew services");
    alert(`Renew ${renewingSoon.count} service(s)`);
  };

  return (
    <div className="space-y-6">
      {/* Order New Hosting Banner */}
      <OrderNewHostingBanner onOrderClick={handleOrderNew} />

      {/* Services Renewing Soon Card */}
      {renewingSoon.count > 0 && (
        <ServicesRenewingSoonCard data={renewingSoon} onRenew={handleRenew} />
      )}

      {/* Active Services List */}
      <ActiveServicesList services={services} onManage={handleManage} />
    </div>
  );
}
