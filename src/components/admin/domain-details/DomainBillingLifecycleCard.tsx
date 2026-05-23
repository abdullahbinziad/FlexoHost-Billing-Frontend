"use client";

import { Calendar, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/utils/format";

interface Option {
  value: string;
  label: string;
}

interface DomainBillingLifecycleCardProps {
  lifecycleStatus: string;
  lifecycleStatusOptions: Option[];
  billingCycle: string;
  billingCycleOptions: string[];
  registrationDate: string;
  nextDueDate: string;
  firstPaymentAmount: string;
  recurringAmount: string;
  currency: string;
  currencyOptions: Option[];
  registrarExpiry?: string;
  registrarStatus?: string;
  lastRegistrarSyncAt?: string;
  isSaving: boolean;
  onLifecycleStatusChange: (value: string) => void;
  onBillingCycleChange: (value: string) => void;
  onRegistrationDateChange: (value: string) => void;
  onNextDueDateChange: (value: string) => void;
  onFirstPaymentAmountChange: (value: string) => void;
  onRecurringAmountChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onSave: () => void;
}

export function DomainBillingLifecycleCard({
  lifecycleStatus,
  lifecycleStatusOptions,
  billingCycle,
  billingCycleOptions,
  registrationDate,
  nextDueDate,
  firstPaymentAmount,
  recurringAmount,
  currency,
  currencyOptions,
  registrarExpiry,
  registrarStatus,
  lastRegistrarSyncAt,
  isSaving,
  onLifecycleStatusChange,
  onBillingCycleChange,
  onRegistrationDateChange,
  onNextDueDateChange,
  onFirstPaymentAmountChange,
  onRecurringAmountChange,
  onCurrencyChange,
  onSave,
}: DomainBillingLifecycleCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            Billing & Lifecycle
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Billing values control invoices and client display. Registrar expiry and status are synced separately.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={onSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Domain Lifecycle Status</label>
          <Select value={lifecycleStatus} onValueChange={onLifecycleStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lifecycleStatusOptions.map((statusOption) => (
                <SelectItem key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Billing Cycle</label>
          <Select value={billingCycle} onValueChange={onBillingCycleChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {billingCycleOptions.map((cycle) => (
                <SelectItem key={cycle} value={cycle}>
                  {cycle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Billing Registration Date</label>
          <Input type="date" value={registrationDate} onChange={(event) => onRegistrationDateChange(event.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Billing Next Due Date</label>
          <Input type="date" value={nextDueDate} onChange={(event) => onNextDueDateChange(event.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">First Registration Amount</label>
          <Input type="number" min="0" step="0.01" value={firstPaymentAmount} onChange={(event) => onFirstPaymentAmountChange(event.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recurring Amount</label>
          <Input type="number" min="0" step="0.01" value={recurringAmount} onChange={(event) => onRecurringAmountChange(event.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Currency</label>
          <Select value={currency} onValueChange={onCurrencyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((currencyOption) => (
                <SelectItem key={currencyOption.value} value={currencyOption.value}>
                  {currencyOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Registrar Expiry Date</label>
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
            {registrarExpiry ? formatDate(registrarExpiry, "short") : "—"}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Registrar Status</label>
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">{registrarStatus || "—"}</div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Registrar Sync</label>
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
            {lastRegistrarSyncAt ? formatDate(lastRegistrarSyncAt, "short") : "Never synced"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
