"use client";

import { cn } from "@/lib/utils";

export const TICKET_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  answered: "Answered",
  customer_reply: "Customer replied",
  on_hold: "On hold",
  in_progress: "In progress",
  closed: "Closed",
  resolved: "Resolved",
};

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; border: string; dot?: string }
> = {
  open: {
    bg: "bg-blue-100 dark:bg-blue-950/50",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  answered: {
    bg: "bg-amber-100 dark:bg-amber-950/50",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  customer_reply: {
    bg: "bg-emerald-100 dark:bg-emerald-950/50",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  on_hold: {
    bg: "bg-slate-100 dark:bg-slate-800/50",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
    dot: "bg-slate-500",
  },
  in_progress: {
    bg: "bg-violet-100 dark:bg-violet-950/50",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-800",
    dot: "bg-violet-500",
  },
  closed: {
    bg: "bg-neutral-100 dark:bg-neutral-800/50",
    text: "text-neutral-600 dark:text-neutral-400",
    border: "border-neutral-200 dark:border-neutral-700",
    dot: "bg-neutral-500",
  },
  resolved: {
    bg: "bg-green-100 dark:bg-green-950/50",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-800",
    dot: "bg-green-500",
  },
};

interface TicketStatusBadgeProps {
  status: string;
  label?: string;
  showDot?: boolean;
  className?: string;
}

export function TicketStatusBadge({
  status,
  label,
  showDot = true,
  className,
}: TicketStatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.closed;
  const displayLabel = label ?? TICKET_STATUS_LABELS[status] ?? status;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      {showDot && (
        <span
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", style.dot)}
          aria-hidden
        />
      )}
      {displayLabel}
    </span>
  );
}
