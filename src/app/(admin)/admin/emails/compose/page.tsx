"use client";

import Link from "next/link";
import { EmailComposer } from "@/components/admin/email-composer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ComposeEmailPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Compose Email
        </h1>
        <p className="text-muted-foreground mt-1">
          Send an email to one or more clients. Search and select recipients below. Outbound mail uses the{" "}
          <Link href="/admin/settings/smtp" className="underline font-medium text-foreground">
            SMTP settings
          </Link>{" "}
          configured for this installation—confirm them with &quot;Test email&quot; if sends fail.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Email</CardTitle>
          <CardDescription>
            Select recipients, enter subject and message. Use {"{{firstName}}"} and {"{{lastName}}"} for personalization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailComposer
            open={true}
            onOpenChange={() => {}}
            mode="inline"
          />
        </CardContent>
      </Card>
    </div>
  );
}
