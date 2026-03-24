"use client";

import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  low: {
    bg: "bg-slate-100 dark:bg-slate-800/50",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-700",
  },
  normal: {
    bg: "bg-blue-100 dark:bg-blue-950/50",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
  },
  high: {
    bg: "bg-amber-100 dark:bg-amber-950/50",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
  },
  urgent: {
    bg: "bg-red-100 dark:bg-red-950/50",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800",
  },
};

interface TicketPriorityBadgeProps {
  priority: string;
  className?: string;
}

export function TicketPriorityBadge({ priority, className }: TicketPriorityBadgeProps) {
  const style = PRIORITY_STYLES[priority?.toLowerCase()] ?? PRIORITY_STYLES.normal;
  const label = priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : "Normal";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      {label}
    </span>
  );
}
