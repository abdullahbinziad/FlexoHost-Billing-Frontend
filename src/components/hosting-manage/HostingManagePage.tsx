"use client";

import { Breadcrumbs } from "./Breadcrumbs";
import { ServiceHeader } from "./ServiceHeader";
import { ServiceOverviewCard } from "./ServiceOverviewCard";
import { UsageStatisticsCard } from "./UsageStatisticsCard";
import { QuickActionsBar } from "./QuickActionsBar";
import { QuickShortcutsCard } from "./QuickShortcutsCard";
import { BillingOverviewCard } from "./BillingOverviewCard";
import { QuickCreateEmailCard } from "./QuickCreateEmailCard";
import type { HostingServiceDetails } from "@/types/hosting-manage";

interface HostingManagePageProps {
  service: HostingServiceDetails;
}

export function HostingManagePage({ service }: HostingManagePageProps) {
  const breadcrumbs = [
    { label: "Portal Home", href: "/client" },
    { label: "Client Area", href: "/client" },
    { label: "My Products & Services", href: "/hosting" },
    { label: "Product Details" },
  ];

  const handleCreateEmail = (username: string, password: string) => {
    // TODO: Implement email creation
    console.log("Create email:", username, password);
    alert(`Email account ${username}@${service.domain} will be created`);
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Service Header with Status */}
      <ServiceHeader service={service} />

      {/* Service Overview - Combined Info */}
      <ServiceOverviewCard service={service} />

      {/* Quick Actions Bar */}
      <QuickActionsBar service={service} />

      {/* Usage Statistics and Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
        <div className="lg:col-span-2 flex">
          <UsageStatisticsCard service={service} />
        </div>
        <div className="lg:col-span-3 flex">
          <QuickShortcutsCard />
        </div>
      </div>

      {/* Billing Overview and Email Creation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BillingOverviewCard service={service} />
        <QuickCreateEmailCard service={service} onCreateEmail={handleCreateEmail} />
      </div>
    </div>
  );
}
