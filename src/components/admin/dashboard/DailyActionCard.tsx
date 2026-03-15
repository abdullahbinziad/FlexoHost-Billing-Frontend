"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface DailyActionCardProps {
  title: string;
  icon: LucideIcon;
  /** Primary count (e.g. 0); ignored when statusOverride is set */
  primaryValue?: number | string;
  /** Label under primary (e.g. "Generated", "Added") */
  primaryLabel?: string;
  /** Optional secondary line: "X Captured, Y Declined" or "X Processed, Y Failed" */
  secondary?: React.ReactNode;
  /** Optional status override instead of primary (e.g. "Task has not completed.", "Disabled") */
  statusOverride?: string;
  /** Link for "view detail" – card is clickable when set */
  detailHref?: string;
  /** Open modal or detail list for the primary count */
  onPrimaryClick?: () => void;
  /** Red text for failed/declined count */
  failedCount?: number;
  declinedCount?: number;
  className?: string;
}

export function DailyActionCard({
  title,
  icon: Icon,
  primaryValue,
  primaryLabel,
  secondary,
  statusOverride,
  detailHref,
  onPrimaryClick,
  failedCount,
  declinedCount,
  className,
}: DailyActionCardProps) {
  const content = (
    <Card
      className={cn(
        "transition-colors",
        detailHref && !onPrimaryClick && "cursor-pointer hover:bg-muted/50",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      </CardHeader>
      <CardContent>
        {statusOverride ? (
          <p className="text-sm text-muted-foreground">{statusOverride}</p>
        ) : (
          <>
            {onPrimaryClick ? (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onPrimaryClick();
                }}
                className="text-2xl font-bold text-left hover:text-primary transition-colors"
              >
                {primaryValue ?? 0}
              </button>
            ) : (
              <div className="text-2xl font-bold">{primaryValue ?? 0}</div>
            )}
            {(primaryLabel ?? "") && (
              <p className="text-xs text-muted-foreground mt-0.5">{primaryLabel}</p>
            )}
            {secondary != null && (
              <p className="text-xs text-muted-foreground mt-0.5">{secondary}</p>
            )}
            {(failedCount != null && failedCount > 0) ||
            (declinedCount != null && declinedCount > 0) ? (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {[
                  declinedCount != null &&
                    declinedCount > 0 &&
                    `${declinedCount} Declined`,
                  failedCount != null &&
                    failedCount > 0 &&
                    `${failedCount} Failed`,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            ) : null}
            {onPrimaryClick ? (
              <p className="text-xs text-primary mt-2">Click the count to view items</p>
            ) : null}
            {detailHref && onPrimaryClick ? (
              <div className="mt-2">
                <Link
                  href={detailHref}
                  className="text-xs text-primary hover:underline"
                >
                  Open full page
                </Link>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );

  if (detailHref && !onPrimaryClick) {
    return (
      <Link href={detailHref} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
