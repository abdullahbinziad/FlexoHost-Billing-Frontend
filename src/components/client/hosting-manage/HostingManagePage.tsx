"use client";

import { Breadcrumbs } from "./Breadcrumbs";
import { ServiceHeader } from "./ServiceHeader";
import { ServiceOverviewCard } from "./ServiceOverviewCard";
import { UsageStatisticsCard } from "./UsageStatisticsCard";
import { QuickShortcutsCard } from "./QuickShortcutsCard";
import { BillingOverviewCard } from "./BillingOverviewCard";
import { QuickCreateEmailCard } from "./QuickCreateEmailCard";
import type { HostingServiceDetails } from "@/types/hosting-manage";

interface HostingManagePageProps {
  clientId: string;
  service: HostingServiceDetails;
  /** When set, user is managing this client's service via grant access. Breadcrumbs and context show "Shared with me" → "[Name]'s services". */
  sharedFor?: { clientName: string };
}

export function HostingManagePage({ clientId, service, sharedFor }: HostingManagePageProps) {
  const breadcrumbs = sharedFor
    ? [
        { label: "Shared with me", href: "/shared-with-me" },
        { label: `${sharedFor.clientName}'s services`, href: `/shared-with-me/${clientId}` },
        { label: service?.name || "Hosting", href: undefined },
        { label: "Product Details" },
      ]
    : [
        { label: "Portal Home", href: "/client" },
        { label: "Client Area", href: "/client" },
        { label: "My Products & Services", href: "/hosting" },
        { label: "Product Details" },
      ];

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Service Header with Status */}
      <ServiceHeader service={service} />

      {/* Service Overview - Combined Info */}
      <ServiceOverviewCard service={service} />

      {/* Usage Statistics and Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
        <div className="lg:col-span-2 flex">
          <UsageStatisticsCard clientId={clientId} service={service} />
        </div>
        <div className="lg:col-span-3 flex">
          <QuickShortcutsCard clientId={clientId} service={service} />
        </div>
      </div>

      {/* Billing Overview and Email Creation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BillingOverviewCard service={service} />
        <QuickCreateEmailCard clientId={clientId} service={service} />
      </div>
    </div>
  );
}
