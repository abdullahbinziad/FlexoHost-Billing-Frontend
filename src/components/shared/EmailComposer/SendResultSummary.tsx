"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type { BulkEmailResultItem } from "@/store/api/emailApi";

interface SendResultSummaryProps {
  sent: number;
  failed: number;
  total: number;
  results: BulkEmailResultItem[];
}

export function SendResultSummary({ sent, failed, total, results }: SendResultSummaryProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          Sent: {sent}
        </span>
        {failed > 0 && (
          <span className="flex items-center gap-1.5 text-destructive">
            <XCircle className="h-4 w-4" />
            Failed: {failed}
          </span>
        )}
        <span className="text-muted-foreground">Total: {total}</span>
      </div>
      {results.length > 0 && (
        <div className="max-h-32 overflow-y-auto border rounded-md divide-y">
          {results.map((r) => (
            <div
              key={r.clientId}
              className="flex items-center justify-between px-3 py-2 text-sm"
            >
              <span className="truncate flex-1">
                {r.email || r.clientId}
              </span>
              {r.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              ) : (
                <span className="text-destructive text-xs shrink-0">
                  {r.error || "Failed"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
