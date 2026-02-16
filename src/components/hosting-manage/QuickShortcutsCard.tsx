"use client";

import {
  Mail,
  ArrowRight,
  Reply,
  Folder,
  RotateCcw,
  Globe,
  Plus,
  Calendar,
  Database,
  Server,
  BarChart2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface QuickShortcut {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
}

const shortcuts: QuickShortcut[] = [
  { id: "email", label: "Email Accounts", icon: Mail, href: "#" },
  { id: "forwarders", label: "Forwarders", icon: ArrowRight, href: "#" },
  { id: "autoresponders", label: "Autoresponders", icon: Reply, href: "#" },
  { id: "file-manager", label: "File Manager", icon: Folder, href: "#" },
  { id: "backup", label: "Backup", icon: RotateCcw, href: "#" },
  { id: "subdomains", label: "Subdomains", icon: Globe, href: "#" },
  { id: "addon-domains", label: "Addon Domains", icon: Plus, href: "#" },
  { id: "cron-jobs", label: "Cron Jobs", icon: Calendar, href: "#" },
  { id: "mysql", label: "MySQL® Databases", icon: Database, href: "#" },
  { id: "phpmyadmin", label: "phpMyAdmin", icon: Server, href: "#" },
  { id: "awstats", label: "Awstats", icon: BarChart2, href: "#" },
];

export function QuickShortcutsCard() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 w-full flex flex-col">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Quick Shortcuts
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 flex-1">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          const content = (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer group aspect-square">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors">
                <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight line-clamp-2">
                {shortcut.label}
              </span>
            </div>
          );

          if (shortcut.href) {
            return (
              <Link key={shortcut.id} href={shortcut.href} className="flex-1">
                {content}
              </Link>
            );
          }

          return (
            <Button
              key={shortcut.id}
              variant="ghost"
              onClick={shortcut.onClick}
              className="flex-1 h-full p-0 text-left"
            >
              {content}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
