"use client";

import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SharedAccessBannerProps {
  /** Label for "You are managing X's account". */
  accountLabel: string;
  /** When in main client area: show "Switch back to my account" and call this. */
  onSwitchBack?: () => void;
  /** When set, show "Back to services" link to shared-with-me/[clientId]. */
  clientId?: string;
  /** When set (and no onSwitchBack), show "Shared with me" link. */
  showSharedWithMeLink?: boolean;
  /** When 'top', full width at top of layout (no rounded corners, no margin). */
  placement?: "inline" | "top";
}

/**
 * Banner shown when the user is managing another client's services (grant access).
 * Use in main client layout with onSwitchBack to clear acting-as and go home.
 * Use on shared-with-me/[clientId] pages with clientId and showSharedWithMeLink.
 */
export function SharedAccessBanner({
  accountLabel,
  onSwitchBack,
  clientId,
  showSharedWithMeLink = true,
  placement = "inline",
}: SharedAccessBannerProps) {
  const isTop = placement === "top";
  return (
    <div
      role="banner"
      className={
        isTop
          ? "w-full min-h-14 border-b border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 flex items-center"
          : "rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 mb-6"
      }
    >
      <div className={cn("flex flex-wrap items-center justify-between gap-3 w-full", isTop && "max-w-7xl mx-auto")}>
        <div className="flex flex-wrap items-center gap-2">
          <Share2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
            You are managing <span className="font-semibold">{accountLabel}</span>&apos;s account
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onSwitchBack ? (
            <Button variant="outline" size="sm" onClick={onSwitchBack} className="flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Switch back to my account
            </Button>
          ) : (
            <>
              {clientId && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/shared-with-me/${clientId}`} className="flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" />
                    Back to services
                  </Link>
                </Button>
              )}
              {showSharedWithMeLink && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/shared-with-me">Shared with me</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
