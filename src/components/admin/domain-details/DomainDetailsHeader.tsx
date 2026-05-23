"use client";

import { ArrowLeft, ExternalLink, Globe, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DomainDetailsHeaderProps {
  clientId: string;
  domainName: string;
  lifecycleStatus: string;
  lifecycleLabel: string;
  packageName?: string;
  isRenewing: boolean;
  onRenew: () => void;
}

export function DomainDetailsHeader({
  clientId,
  domainName,
  lifecycleStatus,
  lifecycleLabel,
  packageName,
  isRenewing,
  onRenew,
}: DomainDetailsHeaderProps) {
  const badgeClass =
    lifecycleStatus === "ACTIVE"
      ? "bg-green-500 hover:bg-green-600"
      : lifecycleStatus === "PENDING_TRANSFER" || lifecycleStatus === "PENDING_REGISTRATION"
        ? "bg-amber-500"
        : "bg-gray-500";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <Button variant="ghost" size="sm" className="pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-foreground mb-2" asChild>
          <Link href={`/admin/clients/${clientId}/domains`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Domains
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{domainName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={badgeClass}>{lifecycleLabel}</Badge>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{packageName ?? "Domain"}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <a href={`https://${domainName}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" /> Visit Site
          </a>
        </Button>
        <Button onClick={onRenew} disabled={isRenewing}>
          {isRenewing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Renew Domain
        </Button>
      </div>
    </div>
  );
}
