"use client";

import {
  ExternalLink,
  Mail,
  Lock,
  Settings,
  RefreshCw,
  Download,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { HostingServiceDetails } from "@/types/hosting-manage";

interface QuickActionsBarProps {
  service: HostingServiceDetails;
}

export function QuickActionsBar({ service }: QuickActionsBarProps) {
  const actions = [
    {
      id: "cpanel",
      label: "cPanel",
      icon: Settings,
      href: "#",
    },
    {
      id: "webmail",
      label: "Webmail",
      icon: Mail,
      href: "#",
    },
    {
      id: "change-password",
      label: "Change Password",
      icon: Lock,
      href: "#",
    },
    {
      id: "backup",
      label: "Backup",
      icon: Download,
      href: "#",
    },
    {
      id: "renew",
      label: "Renew",
      icon: RefreshCw,
      href: "#",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
          Quick Actions:
        </span>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                "hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
