"use client";

import Link from "next/link";
import { LucideIcon, CreditCard, MessageSquare, Users, Grid3x3, ShoppingCart, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuickLinkItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

const DEFAULT_LINKS: QuickLinkItem[] = [
  { href: "/hosting", label: "Hosting", icon: Grid3x3, description: "Manage hosting" },
  { href: "/domains", label: "Domains", icon: Globe, description: "Manage domains" },
  { href: "/billing", label: "Billing", icon: CreditCard, description: "Invoices & payments" },
  { href: "/tickets", label: "Support", icon: MessageSquare, description: "Open a ticket" },
  { href: "/account", label: "Account", icon: Users, description: "Profile, billing & access" },
  { href: "/checkout", label: "Order", icon: ShoppingCart, description: "New service" },
];

export interface DashboardQuickLinksProps {
  links?: QuickLinkItem[];
  className?: string;
}

export function DashboardQuickLinks({
  links = DEFAULT_LINKS,
  className,
}: DashboardQuickLinksProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3", className)}>
      {links.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-800",
              "bg-white dark:bg-gray-900 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-center">{item.label}</span>
            {item.description && (
              <span className="text-xs text-muted-foreground text-center">
                {item.description}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
