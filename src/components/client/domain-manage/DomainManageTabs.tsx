"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  RefreshCw,
  Server,
  Lock,
  Plus,
  User,
  Globe,
  Key,
  Network,
  Mail,
  ArrowRight,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TabItem } from "@/types/domain-manage";

interface DomainManageTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function DomainManageTabs({ activeTab, onTabChange }: DomainManageTabsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["manage", "actions"])
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const manageTabs: TabItem[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, section: "manage" },
    { id: "dns-management", label: "DNS Management", icon: Network, section: "manage" },
    { id: "contact-info", label: "Contact Information", icon: User, section: "manage" },
    { id: "email-forwarding", label: "Email Forwarding", icon: Mail, section: "manage" },
  ];

  const actionTabs: TabItem[] = [
    { id: "renew", label: "Renew", icon: RefreshCw, section: "actions" },
    { id: "register-new", label: "Register a New Domain", icon: Globe2, section: "actions" },
    { id: "transfer", label: "Transfer in a Domain", icon: ArrowRight, section: "actions" },
  ];

  const renderTab = (tab: TabItem) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;

    return (
      <Button
        key={tab.id}
        variant={isActive ? "secondary" : "ghost"}
        onClick={() => onTabChange(tab.id)}
        className="w-full justify-start"
      >
        {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
        <span>{tab.label}</span>
      </Button>
    );
  };

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        {/* Manage Section */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => toggleSection("manage")}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Manage</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {expandedSections.has("manage") ? "−" : "+"}
            </span>
          </button>
          {expandedSections.has("manage") && (
            <div className="pb-2 px-2">
              {manageTabs.map(renderTab)}
            </div>
          )}
        </div>

        {/* Actions Section */}
        <div>
          <Button
            variant="ghost"
            onClick={() => toggleSection("actions")}
            className="w-full justify-between"
          >
            <span className="text-sm font-semibold">Actions</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {expandedSections.has("actions") ? "−" : "+"}
            </span>
          </Button>
          {expandedSections.has("actions") && (
            <div className="pb-2 px-2">
              {actionTabs.map(renderTab)}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
