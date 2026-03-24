"use client";

import { useState } from "react";
import { Breadcrumbs } from "../hosting-manage/Breadcrumbs";
import { DomainHeader } from "./DomainHeader";
import { DomainManageTabs } from "./DomainManageTabs";
import { OverviewTab } from "./OverviewTab";
import { QuickActionsCard } from "./QuickActionsCard";
import { ContactInfoTab } from "./ContactInfoTab";
import { DnsManagementTab } from "./DnsManagementTab";
import { EmailForwardingTab } from "./EmailForwardingTab";
import { RenewTab } from "./RenewTab";
import { RegisterNewTab } from "./RegisterNewTab";
import { TransferTab } from "./TransferTab";
import { useUpdateNameserversMutation, useRenewDomainMutation } from "@/store/api/domainApi";
import { devLog } from "@/lib/devLog";
import type { DomainDetails } from "@/types/domain-manage";

interface DomainManagePageProps {
  domain: DomainDetails;
  domainName: string;
}

export function DomainManagePage({ domain, domainName }: DomainManagePageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [nameservers, setNameservers] = useState<string[]>(domain.nameservers ?? []);
  const [updateNameservers] = useUpdateNameserversMutation();
  const [renewDomain, { isLoading: isRenewing }] = useRenewDomainMutation();

  const breadcrumbs = [
    { label: "Portal Home", href: "/client" },
    { label: "Client Area", href: "/client" },
    { label: "My Domains", href: "/domains" },
    { label: domain.name },
  ];

  const handleAutoRenewalChange = (enabled: boolean) => {
    // TODO: Backend PATCH /domains/:domain for auto-renewal when available
  };

  const handleNameserversChange = async (newNameservers: string[]) => {
    try {
      await updateNameservers({ domainName, nameservers: newNameservers }).unwrap();
      setNameservers(newNameservers);
    } catch (err) {
      devLog("Failed to update nameservers:", err);
    }
  };

  const handleLockChange = (locked: boolean) => {
    // TODO: Backend support for registrar lock when available
  };

  const handleRenew = async () => {
    try {
      await renewDomain({ domainName, years: 1 }).unwrap();
      setActiveTab("renew");
      // Cache invalidation will refetch domain details in the parent page
    } catch (err) {
      devLog("Renew failed:", err);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab domain={domain} onTabChange={setActiveTab} />;
      case "dns-management":
        return <DnsManagementTab domain={domain} />;
      case "contact-info":
        return <ContactInfoTab domain={domain} />;
      case "email-forwarding":
        return <EmailForwardingTab domain={domain} />;
      case "renew":
        return <RenewTab domain={domain} onRenew={handleRenew} isRenewing={isRenewing} />;
      case "register-new":
        return <RegisterNewTab />;
      case "transfer":
        return <TransferTab domain={domain} />;
      default:
        return <OverviewTab domain={domain} onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Domain Header */}
      <DomainHeader domain={domain} />

      {/* Quick Actions Card */}
      <QuickActionsCard
        domain={{ ...domain, nameservers }}
        domainName={domainName}
        onAutoRenewalChange={handleAutoRenewalChange}
        onLockChange={handleLockChange}
        onNameserversChange={handleNameserversChange}
      />

      {/* Main Content Layout */}
      <div className="flex gap-4">
        {/* Left Sidebar - Tabs */}
        <DomainManageTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Right Content Area */}
        <div className="flex-1">{renderTabContent()}</div>
      </div>
    </div>
  );
}
