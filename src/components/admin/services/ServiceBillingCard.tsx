"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import type { HostingServiceDetails } from "@/types/hosting-manage";

export interface ServiceBillingCardProps {
  service: HostingServiceDetails;
}

export function ServiceBillingCard({ service }: ServiceBillingCardProps) {
  const formatCurrency = useFormatCurrency();
  const billing = service.billing;

  if (!billing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Billing Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No billing data available.</p>
        </CardContent>
      </Card>
    );
  }

  const currency = billing.currency ?? "BDT";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          Billing Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">
            Registration date
          </label>
          <p className="font-medium">{billing.registrationDate || "—"}</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">
            Next due date
          </label>
          <p className="font-medium">{billing.nextDueDate || "—"}</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">
            Billing cycle
          </label>
          <p className="font-medium">{billing.billingCycle || "—"}</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">
            Recurring amount
          </label>
          <p className="font-medium">
            {formatCurrency(billing.recurringAmount ?? 0, currency)}
          </p>
        </div>
        {billing.paymentMethod && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">
              Payment method
            </label>
            <p className="font-medium">{billing.paymentMethod}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
