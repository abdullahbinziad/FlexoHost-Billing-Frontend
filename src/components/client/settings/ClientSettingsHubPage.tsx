"use client";

import Link from "next/link";
import { Bell, Activity, Shield, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DarkModeToggle } from "@/components/shared/DarkModeToggle";
import { cn } from "@/lib/utils";

const RELATED: Array<{ href: string; title: string; description: string; icon: typeof Bell }> = [
  {
    href: "/notifications",
    title: "Notifications",
    description: "Read and manage alerts from billing, services, and support.",
    icon: Bell,
  },
  {
    href: "/status",
    title: "System status",
    description: "Check platform and service availability.",
    icon: Activity,
  },
  {
    href: "/grant-access",
    title: "Access & sharing",
    description: "Control who can manage your account and services.",
    icon: Shield,
  },
];

export function ClientSettingsHubPage() {
  return (
    <div className="w-full mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Preferences for this client area and shortcuts to alerts and access.
        </p>
      </div>

      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
          <CardDescription>Choose light or dark theme for the dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Theme</span>
          <DarkModeToggle />
        </CardContent>
      </Card>

      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Related</h2>
        <div className="grid gap-3 sm:grid-cols-1">
          {RELATED.map(({ href, title, description, icon: Icon }) => (
            <Link key={href} href={href} className="group block">
              <Card
                className={cn(
                  "transition-colors border-gray-200 dark:border-gray-800",
                  "hover:border-primary/40 hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                )}
              >
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <CardTitle className="text-base font-semibold">{title}</CardTitle>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <CardDescription className="mt-0.5">{description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Profile, email, and password are under{" "}
        <Link href="/me" className="text-primary hover:underline">
          Profile &amp; account
        </Link>
        .
      </p>
    </div>
  );
}
