"use client";

import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface SalesStatCardProps {
  title: string;
  value: React.ReactNode;
  viewAllHref: string;
  viewAllLabel?: string;
  icon: LucideIcon;
  /** Optional: trend or subtitle (e.g. "vs last month") */
  hint?: React.ReactNode;
  /** Optional: variant for emphasis (e.g. revenue = default, unpaid = destructive) */
  variant?: "default" | "muted" | "success" | "warning" | "destructive";
}

const variantStyles: Record<NonNullable<SalesStatCardProps["variant"]>, string> = {
  default: "",
  muted: "text-muted-foreground",
  success: "text-green-600 dark:text-green-400",
  warning: "text-amber-600 dark:text-amber-400",
  destructive: "text-red-600 dark:text-red-400",
};

export function SalesStatCard({
  title,
  value,
  viewAllHref,
  viewAllLabel = "View all",
  icon: Icon,
  hint,
  variant = "default",
}: SalesStatCardProps) {
  const valueClass = variantStyles[variant];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
        {hint != null && hint !== "" && (
          <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
        )}
        <Link
          href={viewAllHref}
          className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
        >
          {viewAllLabel} <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
