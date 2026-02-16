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
import type { DomainDetails } from "@/types/domain-manage";

interface DomainManagePageProps {
  domain: DomainDetails;
}

export function DomainManagePage({ domain }: DomainManagePageProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const breadcrumbs = [
    { label: "Portal Home", href: "/client" },
    { label: "Client Area", href: "/client" },
    { label: "My Domains", href: "/domains" },
    { label: domain.name },
  ];

  const handleAutoRenewalChange = (enabled: boolean) => {
    // TODO: Implement auto-renewal change
    console.log("Auto-renewal changed:", enabled);
  };

  const handleNameserversChange = (nameservers: string[]) => {
    // TODO: Implement nameservers change
    console.log("Nameservers changed:", nameservers);
  };

  const handleLockChange = (locked: boolean) => {
    // TODO: Implement lock change
    console.log("Registrar lock changed:", locked);
  };

  const handleGetEppCode = () => {
    // TODO: Implement EPP code retrieval
    console.log("Get EPP code for:", domain.name);
  };

  const handleRenew = () => {
    // TODO: Implement renew
    console.log("Renew domain:", domain.id);
    alert(`Renew domain: ${domain.name}`);
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
        return <RenewTab domain={domain} onRenew={handleRenew} />;
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
        domain={domain}
        onAutoRenewalChange={handleAutoRenewalChange}
        onLockChange={handleLockChange}
        onNameserversChange={handleNameserversChange}
        onGetEppCode={handleGetEppCode}
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
