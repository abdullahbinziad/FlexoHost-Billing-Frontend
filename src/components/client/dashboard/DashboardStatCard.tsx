"use client";

import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface DashboardStatCardProps {
  title: string;
  value: React.ReactNode;
  viewAllHref: string;
  viewAllLabel?: string;
  icon: LucideIcon;
  /** Optional subtitle or hint below the value (e.g. "2 unpaid") */
  hint?: React.ReactNode;
}

export function DashboardStatCard({
  title,
  value,
  viewAllHref,
  viewAllLabel = "View all",
  icon: Icon,
  hint,
}: DashboardStatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {hint && (
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
