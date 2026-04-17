"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, RefreshCw } from "lucide-react";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import type { HostingServiceDetails } from "@/types/hosting-manage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ServiceBillingCardProps {
  service: HostingServiceDetails;
  editable?: boolean;
  registrationDate?: string;
  firstPaymentAmount?: string;
  recurringAmount?: string;
  paymentMethod?: string;
  currency?: string;
  paymentMethodOptions?: Array<{ value: string; label: string }>;
  onRegistrationDateChange?: (value: string) => void;
  onFirstPaymentAmountChange?: (value: string) => void;
  onRecurringAmountChange?: (value: string) => void;
  onRecalculateRecurring?: () => void;
  recalculateDisabled?: boolean;
  onPaymentMethodChange?: (value: string) => void;
  onCurrencyChange?: (value: string) => void;
  onSaveChanges?: () => void;
  isSavingChanges?: boolean;
  disableSaveChanges?: boolean;
}

export function ServiceBillingCard({
  service,
  editable = false,
  registrationDate = "",
  firstPaymentAmount = "",
  recurringAmount = "",
  paymentMethod = "",
  currency = "",
  paymentMethodOptions = [],
  onRegistrationDateChange,
  onFirstPaymentAmountChange,
  onRecurringAmountChange,
  onRecalculateRecurring,
  recalculateDisabled = false,
  onPaymentMethodChange,
  onCurrencyChange,
  onSaveChanges,
  isSavingChanges = false,
  disableSaveChanges = false,
}: ServiceBillingCardProps) {
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

  const displayCurrency = billing.currency ?? "BDT";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Billing Overview
          </CardTitle>
          {editable && onSaveChanges ? (
            <Button size="sm" variant="outline" onClick={onSaveChanges} disabled={isSavingChanges || disableSaveChanges}>
              {isSavingChanges ? "Saving..." : "Save Billing"}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">
            Registration date
          </label>
          {editable ? (
            <Input type="date" value={registrationDate} onChange={(e) => onRegistrationDateChange?.(e.target.value)} />
          ) : (
            <p className="font-medium">{billing.registrationDate || "—"}</p>
          )}
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
            First payment amount
          </label>
          {editable ? (
            <Input
              type="number"
              min="0"
              step="0.01"
              value={firstPaymentAmount}
              onChange={(e) => onFirstPaymentAmountChange?.(e.target.value)}
            />
          ) : (
            <p className="font-medium">
              {formatCurrency(billing.firstPaymentAmount ?? 0, displayCurrency)}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">
            Recurring amount
          </label>
          {editable ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-start gap-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={recurringAmount}
                    onChange={(e) => onRecurringAmountChange?.(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={onRecalculateRecurring}
                    disabled={recalculateDisabled}
                    title="Recalculate price based on package & billing cycle"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="font-medium">
              {formatCurrency(billing.recurringAmount ?? 0, displayCurrency)}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">
            Payment method
          </label>
          {editable ? (
            <Select value={paymentMethod || "__none__"} onValueChange={(value) => onPaymentMethodChange?.(value === "__none__" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {paymentMethodOptions.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="font-medium">{billing.paymentMethod || "—"}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">
            Currency
          </label>
          {editable ? (
            <Select value={currency || "BDT"} onValueChange={onCurrencyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="BDT">BDT</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="font-medium">{billing.currency || "—"}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
