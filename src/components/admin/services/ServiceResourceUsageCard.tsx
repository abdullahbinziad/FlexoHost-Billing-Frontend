"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HardDrive, Globe, Loader2, RefreshCw } from "lucide-react";

export interface ServiceResourceUsageCardProps {
  /** Disk: used and limit in MB */
  disk?: { usedMb: number; limitMb: number };
  /** Bandwidth: used and limit in MB (limit 0 often means unlimited) */
  bandwidth?: { usedMb: number; limitMb: number };
  isLoading?: boolean;
  /** Formatted "Last updated" from usage.updatedAt, or "—" if never refreshed */
  lastUpdated?: string;
  /** Called when user clicks Reload to refresh usage from WHM */
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

function formatMb(n: number): string {
  if (n >= 1024) return `${(n / 1024).toFixed(1)} GB`;
  return `${n} MB`;
}

function usagePercent(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

export function ServiceResourceUsageCard({
  disk,
  bandwidth,
  isLoading = false,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
}: ServiceResourceUsageCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-muted-foreground" />
            Resource Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const diskUsed = disk?.usedMb ?? 0;
  const diskLimit = disk?.limitMb ?? 0;
  const bwUsed = bandwidth?.usedMb ?? 0;
  const bwLimit = bandwidth?.limitMb ?? 0;
  const diskPct = usagePercent(diskUsed, diskLimit);
  const bwPct = bwLimit > 0 ? usagePercent(bwUsed, bwLimit) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-muted-foreground" />
          Resource Usage
        </CardTitle>
        <div className="flex items-center gap-2 shrink-0">
          {lastUpdated !== undefined && (
            <span className="text-xs text-muted-foreground">Last updated: {lastUpdated}</span>
          )}
          {onRefresh && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh usage from server"
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HardDrive className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">Disk</span>
            </div>
            <div className="text-2xl font-bold">{formatMb(diskUsed)}</div>
            <div className="text-xs text-muted-foreground">
              {diskLimit > 0
                ? `of ${formatMb(diskLimit)} (${diskPct}%)`
                : "—"}
            </div>
            {diskLimit > 0 && (
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${diskPct}%` }}
                />
              </div>
            )}
          </div>
          <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">Bandwidth</span>
            </div>
            <div className="text-2xl font-bold">{formatMb(bwUsed)}</div>
            <div className="text-xs text-muted-foreground">
              {bwLimit > 0 ? `of ${formatMb(bwLimit)} (${bwPct}%)` : "Unlimited"}
            </div>
            {bwLimit > 0 && (
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${bwPct}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
