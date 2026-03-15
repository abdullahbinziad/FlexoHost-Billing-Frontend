"use client";

import { EmailComposer } from "@/components/shared/EmailComposer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ComposeEmailPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Compose Email
        </h1>
        <p className="text-muted-foreground mt-1">
          Send an email to one or more clients. Search and select recipients below.
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
