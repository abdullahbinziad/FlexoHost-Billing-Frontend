"use client";

import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import type { BulkEmailResultItem } from "@/store/api/emailApi";

interface SendResultSummaryProps {
  sent: number;
  failed: number;
  total: number;
  results: BulkEmailResultItem[];
}

function looksLikeSmtpAuthFailure(results: BulkEmailResultItem[]): boolean {
  return results.some(
    (r) =>
      !r.success &&
      /535|invalid login|authentication|credentials|5\.7\./i.test(r.error || "")
  );
}

export function SendResultSummary({ sent, failed, total, results }: SendResultSummaryProps) {
  const showSmtpHint = failed > 0 && looksLikeSmtpAuthFailure(results);

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
      {showSmtpHint && (
        <p className="text-xs text-muted-foreground rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
          <span className="font-medium text-destructive">SMTP authentication failed.</span> The mail server
          rejected the configured username or password (not the recipient addresses). Update{" "}
          <Link href="/admin/settings/smtp" className="underline font-medium text-foreground">
            Admin → Settings → SMTP
          </Link>
          , then use &quot;Test email&quot; there. For Gmail with 2FA, use an App Password.
        </p>
      )}
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
