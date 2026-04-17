"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import { Server, HardDrive, Globe, ExternalLink, Loader2, Mail } from "lucide-react";
import type { HostingServiceDetails } from "@/types/hosting-manage";
import { getServiceDisplayDomain } from "./utils";
import { getPendingStatusLabel } from "@/utils/serviceStatusLabel";

const STATUS_VARIANTS: Record<string, string> = {
  active: "bg-green-500 text-white hover:bg-green-600",
  suspended: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  expired: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  terminated: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  cancelled: "bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-300",
  pending: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  provisioning: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  hosting: <Server className="w-6 h-6" />,
  vps: <HardDrive className="w-6 h-6" />,
  domain: <Globe className="w-6 h-6" />,
  email: <Mail className="w-6 h-6" />,
};

const TYPE_ICON_BG: Record<string, string> = {
  hosting: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  vps: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  domain: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  email: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
};

export interface ServiceDetailHeaderProps {
  service: HostingServiceDetails | null;
  backHref: string;
  backLabel?: string;
  /** For hosting: open cPanel in new tab. Called when "Login to cPanel" is clicked. */
  onLoginClick?: () => void;
  /** True while fetching login URL */
  loginLoading?: boolean;
  /** Optional extra actions (e.g. "New Addon") */
  extraActions?: React.ReactNode;
}

export function ServiceDetailHeader({
  service,
  backHref,
  backLabel = "Back",
  onLoginClick,
  loginLoading = false,
  extraActions,
}: ServiceDetailHeaderProps) {
  if (!service) return null;

  const statusKey = service.status?.toLowerCase() ?? "pending";
  const typeKey = service.productType ?? "hosting";
  const displayIdentifier = getServiceDisplayDomain(service);
  const statusLabel =
    statusKey === "pending" || statusKey === "provisioning"
      ? getPendingStatusLabel(service.status, service.pendingReason)
      : service.status;
  const icon = TYPE_ICONS[typeKey] ?? <Server className="w-6 h-6" />;
  const iconBg = TYPE_ICON_BG[typeKey] ?? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <BackButton href={backHref} label={backLabel} />
        <div className="flex items-center gap-3 mt-2">
          <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {service.name || "Service"}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge
                className={`capitalize ${STATUS_VARIANTS[statusKey] ?? ""}`}
                variant={STATUS_VARIANTS[statusKey] ? "default" : "secondary"}
              >
                {statusLabel}
              </Badge>
              {displayIdentifier && (
                <>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{displayIdentifier}</span>
                </>
              )}
              {service.serverLocation && (
                <>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{service.serverLocation}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {typeKey === "hosting" && onLoginClick && (
          <Button
            variant="outline"
            className="bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 hover:text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400"
            onClick={onLoginClick}
            disabled={loginLoading}
          >
            {loginLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4 mr-2" />
            )}
            Login to cPanel
          </Button>
        )}
        {extraActions}
      </div>
    </div>
  );
}
