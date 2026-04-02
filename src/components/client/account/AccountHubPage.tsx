"use client";

import Link from "next/link";
import {
  User,
  CreditCard,
  Shield,
  Share2,
  ShoppingCart,
  ChevronRight,
} from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const LINKS: Array<{
  href: string;
  title: string;
  description: string;
  icon: typeof User;
}> = [
  {
    href: "/me",
    title: "Profile & security",
    description: "Login email, password, and billing contact details.",
    icon: User,
  },
  {
    href: "/billing",
    title: "Billing",
    description: "Invoices, payment methods, and billing history.",
    icon: CreditCard,
  },
  {
    href: "/grant-access",
    title: "Who has access",
    description: "Invite others to help manage your services.",
    icon: Shield,
  },
  {
    href: "/shared-with-me",
    title: "Shared with me",
    description: "Accounts others have granted you access to.",
    icon: Share2,
  },
  {
    href: "/checkout",
    title: "Order services",
    description: "Add hosting, domains, VPS, and more.",
    icon: ShoppingCart,
  },
];

export function AccountHubPage() {
  return (
    <div className="w-full mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground mt-1">
          Your profile, billing, and access settings live in one place. Pick a section below.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {LINKS.map(({ href, title, description, icon: Icon }) => (
          <Link key={href} href={href} className="group block h-full">
            <Card
              className={cn(
                "h-full transition-colors border-gray-200 dark:border-gray-800",
                "hover:border-primary/40 hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
              )}
            >
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <CardTitle className="text-base font-semibold">{title}</CardTitle>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 shrink-0" />
                  </div>
                  <CardDescription className="mt-1.5 text-sm leading-relaxed">
                    {description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Quick paths:{" "}
        <Link href="/invoices" className="text-primary hover:underline">
          Invoices
        </Link>
        {" · "}
        <Link href="/notifications" className="text-primary hover:underline">
          Notifications
        </Link>
        {" · "}
        <Link href="/settings" className="text-primary hover:underline">
          Settings
        </Link>
      </p>
    </div>
  );
}
