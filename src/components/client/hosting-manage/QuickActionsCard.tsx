"use client";

import {
  ExternalLink,
  Mail,
  Lock,
  Settings,
  X,
  RefreshCw,
  Download,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { HostingServiceDetails } from "@/types/hosting-manage";

interface QuickActionsCardProps {
  service: HostingServiceDetails;
}

export function QuickActionsCard({ service }: QuickActionsCardProps) {
  const actions = [
    {
      id: "visit-website",
      label: "Visit Website",
      icon: ExternalLink,
      href: `https://${service.domain}`,
      external: true,
      className: "bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white",
    },
    {
      id: "cpanel",
      label: "cPanel",
      icon: Settings,
      href: "#",
      className: "bg-primary hover:bg-primary/90 text-white",
    },
    {
      id: "webmail",
      label: "Webmail",
      icon: Mail,
      href: "#",
      className: "bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white",
    },
    {
      id: "change-password",
      label: "Change Password",
      icon: Lock,
      href: "#",
      className: "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100",
    },
    {
      id: "backup",
      label: "Backup",
      icon: Download,
      href: "#",
      className: "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100",
    },
    {
      id: "renew",
      label: "Renew Service",
      icon: RefreshCw,
      href: "#",
      className: "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100",
    },
    {
      id: "cancel",
      label: "Request Cancellation",
      icon: X,
      href: "#",
      className: "bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const buttonContent = (
            <div
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors text-center",
                action.className
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{action.label}</span>
            </div>
          );

          if (action.external) {
            return (
              <a
                key={action.id}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {buttonContent}
              </a>
            );
          }

          return (
            <Link key={action.id} href={action.href}>
              {buttonContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
