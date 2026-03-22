"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Mail,
  ArrowRight,
  Reply,
  Folder,
  RotateCcw,
  Calendar,
  Database,
  Server,
  BarChart2,
  Lock,
  Inbox,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useGetCpanelShortcutsQuery, useLazyGetShortcutLoginUrlQuery } from "@/store/api/servicesApi";
import type { HostingServiceDetails } from "@/types/hosting-manage";

interface QuickShortcutsCardProps {
  clientId: string;
  service: HostingServiceDetails;
}

/** Icon by shortcut key (only for keys we expose from backend). */
const SHORTCUT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "cpanel-home": LayoutDashboard,
  webmail: Inbox,
  "email-accounts": Mail,
  forwarders: ArrowRight,
  autoresponders: Reply,
  "file-manager": Folder,
  backup: RotateCcw,
  "cron-jobs": Calendar,
  "mysql-databases": Database,
  phpmyadmin: Server,
  awstats: BarChart2,
  "change-password": Lock,
};

export function QuickShortcutsCard({ clientId, service }: QuickShortcutsCardProps) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const { data, isLoading: shortcutsLoading, isError: shortcutsError } = useGetCpanelShortcutsQuery(
    { clientId, serviceId: service.id },
    { skip: !clientId || !service.id }
  );
  const [getShortcutUrl] = useLazyGetShortcutLoginUrlQuery();

  const handleOpen = async (shortcutKey: string) => {
    if (!clientId || !service.id) return;
    setLoadingKey(shortcutKey);
    try {
      const result = await getShortcutUrl({
        clientId,
        serviceId: service.id,
        shortcutKey,
      }).unwrap();
      if (result?.url) window.open(result.url, "_blank", "noopener,noreferrer");
      else toast.error("Could not open link");
    } catch (e: any) {
      const msg = e?.data?.message ?? e?.message ?? "Failed to open link";
      toast.error(msg);
    } finally {
      setLoadingKey(null);
    }
  };

  const shortcuts = data?.shortcuts ?? [];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 w-full flex flex-col">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Quick Shortcuts
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Open cPanel or Webmail directly (no manual login). Your session is created securely via our server.
      </p>
      {shortcutsLoading && (
        <div className="flex items-center gap-2 py-6 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading shortcuts…</span>
        </div>
      )}
      {shortcutsError && (
        <div className="flex items-center gap-2 py-6 text-destructive">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">Could not load shortcuts. Try again later.</span>
        </div>
      )}
      {!shortcutsLoading && !shortcutsError && shortcuts.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 flex-1">
          {shortcuts.map((shortcut) => {
            const Icon = SHORTCUT_ICONS[shortcut.key] ?? Folder;
            const isLoading = loadingKey === shortcut.key;
            return (
              <button
                key={shortcut.key}
                type="button"
                onClick={() => handleOpen(shortcut.key)}
                disabled={isLoading}
                className="flex-1 h-full p-0 text-left bg-transparent border-0 cursor-pointer"
              >
                <div className="flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer group aspect-square">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : (
                      <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight line-clamp-2">
                    {shortcut.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
      {!shortcutsLoading && !shortcutsError && shortcuts.length === 0 && (
        <p className="text-sm text-muted-foreground py-4">No shortcuts available for this account.</p>
      )}
    </div>
  );
}
