"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            All Systems Operational
          </h1>
          <p className="text-muted-foreground mt-2">
            Our services are running normally. We're here to keep your hosting and
            domains online.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-left space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Web Hosting
              </p>
              <p className="text-sm text-muted-foreground">Operational</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Billing & Invoices
              </p>
              <p className="text-sm text-muted-foreground">Operational</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Domain Services
              </p>
              <p className="text-sm text-muted-foreground">Operational</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Support & Tickets
              </p>
              <p className="text-sm text-muted-foreground">Operational</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <Link
          href="/"
          className="inline-block text-sm text-primary hover:underline"
        >
          ← Back to client area
        </Link>
      </div>
    </div>
  );
}
