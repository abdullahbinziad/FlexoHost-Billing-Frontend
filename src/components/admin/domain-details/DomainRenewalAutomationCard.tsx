"use client";

import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DomainRenewalJobItem } from "@/store/api/servicesApi";
import { formatDateTime } from "@/utils/format";

interface DomainRenewalAutomationCardProps {
  job?: DomainRenewalJobItem;
  isLoading: boolean;
  onRetry: () => void;
  onSync: () => void;
  onMarkRenewed: () => void;
}

function statusVariant(status?: DomainRenewalJobItem["status"]) {
  if (status === "SUCCESS") return "default" as const;
  if (status === "FAILED") return "destructive" as const;
  return "secondary" as const;
}

export function DomainRenewalAutomationCard({
  job,
  isLoading,
  onRetry,
  onSync,
  onMarkRenewed,
}: DomainRenewalAutomationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          {job?.status === "FAILED" ? (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-gray-500" />
          )}
          Renewal Automation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading renewal job status
          </div>
        ) : !job ? (
          <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
            No registrar renewal job recorded for this domain.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
            </div>
            <div className="grid gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Attempts</div>
                <div className="font-medium">{job.attempts}/{job.maxAttempts}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Target registrar expiry</div>
                <div className="font-medium">{formatDateTime(job.renewedUntil)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Last updated</div>
                <div className="font-medium">{formatDateTime(job.updatedAt)}</div>
              </div>
              {job.resolutionSource ? (
                <div>
                  <div className="text-muted-foreground">Resolution source</div>
                  <div className="font-medium">{job.resolutionSource}</div>
                </div>
              ) : null}
              {job.lastError ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                  {job.lastError}
                </div>
              ) : null}
            </div>
            {job.status === "FAILED" ? (
              <div className="grid gap-2">
                <Button variant="outline" onClick={onRetry}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retry Job
                </Button>
                <Button variant="outline" onClick={onSync}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync From Registrar
                </Button>
                <Button onClick={onMarkRenewed}>Mark Manually Renewed</Button>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
